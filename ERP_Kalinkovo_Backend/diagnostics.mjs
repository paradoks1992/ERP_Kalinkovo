// diagnostics.mjs
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import sql from 'mssql';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const root = process.cwd();

function log(title, text='') {
  console.log('\n' + '='.repeat(60));
  console.log(title);
  if (text) console.log(text);
  console.log('='.repeat(60) + '\n');
}

async function checkEnv() {
  log('1) Проверка .env (обязательные переменные)');
  const need = ['DB_SERVER','DB_NAME','DB_USER','DB_PASSWORD','JWT_SECRET'];
  const missing = need.filter(k => !process.env[k]);
  if (missing.length) {
    console.warn('  ⚠️ Отсутствуют переменные:', missing.join(', '));
  } else {
    console.log('  ✅ Все ключевые переменные присутствуют.');
  }
  console.log('  Значения (скрытое):');
  for (const k of need) {
    const v = process.env[k] ? (k.includes('PASSWORD') ? '***' : process.env[k]) : '<empty>';
    console.log(`   - ${k} = ${v}`);
  }
}

async function checkDbConnect() {
  log('2) Проверка подключения к SQL Server (через mssql)');
  const cfg = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    options: { encrypt: true, trustServerCertificate: true },
    pool: { max: 5, min: 0, idleTimeoutMillis: 30000 }
  };
  let pool;
  try {
    pool = await sql.connect(cfg);
    console.log('  ✅ Успешное подключение к базе.');
    // Список таблиц
    const tables = await pool.request().query(`
      SELECT s.name as schema_name, t.name as table_name, t.create_date, t.modify_date
      FROM sys.tables t
      JOIN sys.schemas s ON t.schema_id = s.schema_id
      ORDER BY s.name, t.name
    `);
    console.log(`  ℹ️ Найдено таблиц: ${tables.recordset.length}`);
    const names = tables.recordset.map(r => `${r.schema_name}.${r.table_name}`);
    console.log('   - таблицы (первые 50):');
    names.slice(0,50).forEach(n => console.log('     •', n));

    // Колонки для ключевых таблиц (Tasks, TaskProgress, Operations, Products, ProductBatches, Users, storages)
    const keyTables = ['Tasks','TaskProgress','Operations','Products','ProductBatches','Users','storages'];
    for (const t of keyTables) {
      try {
        const cols = await pool.request()
          .input('tbl', sql.NVarChar, t)
          .query(`
            SELECT c.name, ty.name AS type_name, c.max_length, c.is_nullable, c.is_identity
            FROM sys.columns c
            JOIN sys.types ty ON c.user_type_id = ty.user_type_id
            JOIN sys.tables t ON c.object_id = t.object_id
            WHERE t.name = @tbl
            ORDER BY c.column_id
          `);
        if (cols.recordset.length) {
          console.log(`\n   ✳️ Колонки таблицы ${t}:`);
          cols.recordset.forEach(r => {
            console.log(`     - ${r.name} : ${r.type_name} ${r.is_nullable ? 'NULL' : 'NOT NULL'}${r.is_identity ? ' [IDENTITY]' : ''}`);
          });
        } else {
          console.log(`\n   ⚪ Таблица ${t} не найдена в базе.`);
        }
      } catch (e) {
        console.warn('   Ошибка при получении колонок для', t, e.message);
      }
    }

    // Внешние ключи
    const fks = await pool.request().query(`
      SELECT fk.name AS fk_name,
        sp.name AS parent_table, cp.name AS parent_column,
        sr.name AS referenced_table, cr.name AS referenced_column
      FROM sys.foreign_keys fk
      JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
      JOIN sys.tables sp ON fkc.parent_object_id = sp.object_id
      JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
      JOIN sys.tables sr ON fkc.referenced_object_id = sr.object_id
      JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
      ORDER BY sp.name
    `);
    console.log('\n  🔗 Внешние ключи (первые 50):');
    fks.recordset.slice(0,50).forEach(r => {
      console.log(`   - ${r.fk_name}: ${r.parent_table}.${r.parent_column} -> ${r.referenced_table}.${r.referenced_column}`);
    });

    await pool.close();
  } catch (e) {
    console.error('  ❌ Ошибка подключения/запроса к БД:', e.message);
  } finally {
    try { if (pool && pool.connected) await pool.close(); } catch {}
  }
}

async function scanImports() {
  log('3) Сканирование исходников на опасные/несовместимые импорты (verifyToken / isAdmin)');
  const patterns = [
    { pat: /import\s+verifyToken\s+from\s+['"]/g, name:'verifyToken default import' },
    { pat: /import\s+isAdmin\s+from\s+['"]/g, name:'isAdmin default import' },
    { pat: /module\.exports\s*=/g, name:'CommonJS module.exports usage' },
    { pat: /export\s+default\s+/g, name:'export default usage' },
  ];
  const folder = path.join(root, 'routes');
  let files = [];
  try {
    const all = await walk(root);
    files = all.filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
  } catch (e) {
    console.error('  ❌ Ошибка чтения файлов проекта:', e.message);
    return;
  }

  const hits = [];
  for (const f of files) {
    const txt = await fs.readFile(f, 'utf8');
    for (const p of patterns) {
      if (p.pat.test(txt)) hits.push({ file: path.relative(root, f), issue: p.name });
      // reset lastIndex for global regex
      p.pat.lastIndex = 0;
    }
  }

  if (hits.length === 0) {
    console.log('  ✅ Не найдено проблемных импортов по шаблонам.');
  } else {
    console.log('  ⚠️ Найдены потенциальные проблемные места:');
    hits.forEach(h => console.log(`    • ${h.file} — ${h.issue}`));
    console.log('  Рекомендуется в файлах с default-import заменить на именованные, например: import { verifyToken } from ...');
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(ent => {
    const res = path.resolve(dir, ent.name);
    return ent.isDirectory() ? walk(res) : res;
  }));
  return Array.prototype.concat(...files);
}

async function checkPackage() {
  log('4) Проверка package.json (скрипты и зависимости)');
  try {
    const p = JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
    console.log('  name:', p.name);
    console.log('  scripts:', Object.keys(p.scripts || {}).join(', '));
    console.log('  dependencies count:', Object.keys(p.dependencies||{}).length);
    console.log('  devDependencies count:', Object.keys(p.devDependencies||{}).length);
    if (!p.scripts || !p.scripts.dev) {
      console.warn('  ⚠️ Нет npm script "dev" (nodemon). Рекомендуется для локальной разработки.');
    } else {
      console.log('  ✅ Сенарий "dev" присутствует.');
    }
  } catch (e) {
    console.error('  ❌ Не удалось прочитать package.json:', e.message);
  }
}

async function checkIndexConnectUsage() {
  log('5) Проверка использования db подключения в коде (поиск sql.connect внутри контроллеров)');
  const all = await walk(root);
  const js = all.filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
  const bad = [];
  for (const f of js) {
    const txt = await fs.readFile(f,'utf8');
    if (/sql\.connect\(|new\s+sql\.ConnectionPool\(/.test(txt) && !f.includes('db.js')) {
      bad.push(path.relative(root, f));
    }
  }
  if (bad.length) {
    console.log('  ⚠️ Найдены файлы, в которых создаются новые подключения к БД (не через db.js):');
    bad.forEach(x => console.log('    •', x));
    console.log('  Рекомендуется централизовать соединение в db.js и использовать пул.');
  } else {
    console.log('  ✅ Использование подключения к БД выглядит централизованным (нет явных sql.connect вызовов в контроллерах).');
  }
}

async function main() {
  console.log('\n=== Запуск диагностики backend (КОРЕНЬ проекта: ' + root + ') ===\n');
  await checkEnv();
  await checkDbConnect();
  await scanImports();
  await checkPackage();
  await checkIndexConnectUsage();
  console.log('\n=== Диагностика завершена ===\n');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(2);
});
