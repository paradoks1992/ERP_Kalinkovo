// services/monitor.service.js
import { sql, connectToDb } from "../db.js";
import logger from "../logger.js";

/**
 * Таблица «Яблоки» для холодильника — всегда показывает все сорта,
 * даже если по ним сейчас 0 (нет записей в витрине/операциях).
 */
export async function getAppleMonitor(storageId) {
  const t0 = Date.now();
  await logger.info("getAppleMonitor:start", { storageId });

  try {
    const pool = await connectToDb();

    // Определяем id типа «Яблоки»
    const typeRs = await pool.request().query(`
      SELECT TOP 1 id FROM dbo.ProductTypes
      WHERE name IN (N'Яблоки', N'apples', N'Apples')
      ORDER BY id ASC;
    `);
    const appleTypeId = typeRs.recordset[0]?.id ?? 1;

    // Все активные сорта яблок
    const sortsRs = await pool
      .request()
      .input("typeId", sql.Int, appleTypeId)
      .query(`
        SELECT id, name, is_sorted, category
        FROM dbo.Products
        WHERE type_id = @typeId AND is_active = 1
        ORDER BY name;
      `);

    const appleSorts = sortsRs.recordset;

    // Фактические данные по холодильнику из витрины
    const rs = await pool
      .request()
      .input("storageId", sql.Int, storageId)
      .query(`
        SELECT
          f.product_id,
          f.product_name,
          f.is_sorted,
          f.category,
          ISNULL(f.current_quantity, 0) AS qty,
          ISNULL(f.in_today, 0)         AS in_today,
          ISNULL(f.out_today, 0)        AS out_today
        FROM dbo.v_MonitorFull f
        JOIN dbo.Products p     ON p.id = f.product_id
        JOIN dbo.ProductTypes t ON t.id = p.type_id
        WHERE f.storage_id = @storageId
          AND (t.name IN (N'Яблоки', N'apples', N'Apples') OR t.id = ${appleTypeId});
      `);

    const idx = new Map();
    for (const r of rs.recordset) {
      const key = `${r.product_name}|${r.is_sorted ? 1 : 0}|${r.category ?? 0}`;
      idx.set(key, {
        qty: r.qty,
        inToday: r.in_today,
        outToday: r.out_today,
      });
    }

    const totals = {
      unsorted: { current: 0, inToday: 0, outToday: 0 },
      cat1: { current: 0, inToday: 0, outToday: 0 },
      cat2: { current: 0, inToday: 0, outToday: 0 },
      cat3: { current: 0, inToday: 0, outToday: 0 },
    };

    const rows = [];
    const fallbackSorts = [
      { name: "Ред Чемпион" },
      { name: "Гала" },
      { name: "Голден" },
      { name: "Айдаред" },
      { name: "Джонаголд" },
      { name: "Мутцу" },
      { name: "Глостер" },
    ];
    const list = appleSorts.length > 0 ? appleSorts : fallbackSorts;

    for (const sort of list) {
      const name = sort.name;
      const u = idx.get(`${name}|0|0`) || { qty: 0, inToday: 0, outToday: 0 };
      const c1 = idx.get(`${name}|1|1`) || { qty: 0, inToday: 0, outToday: 0 };
      const c2 = idx.get(`${name}|1|2`) || { qty: 0, inToday: 0, outToday: 0 };
      const c3 = idx.get(`${name}|1|3`) || { qty: 0, inToday: 0, outToday: 0 };

      rows.push({
        sort: name,
        unsorted: { current: u.qty, inToday: u.inToday, outToday: u.outToday },
        cat1: { current: c1.qty, inToday: c1.inToday, outToday: c1.outToday },
        cat2: { current: c2.qty, inToday: c2.inToday, outToday: c2.outToday },
        cat3: { current: c3.qty, inToday: c3.inToday, outToday: c3.outToday },
      });

      totals.unsorted.current += u.qty;
      totals.unsorted.inToday += u.inToday;
      totals.unsorted.outToday += u.outToday;
      totals.cat1.current += c1.qty;
      totals.cat1.inToday += c1.inToday;
      totals.cat1.outToday += c1.outToday;
      totals.cat2.current += c2.qty;
      totals.cat2.inToday += c2.inToday;
      totals.cat2.outToday += c2.outToday;
      totals.cat3.current += c3.qty;
      totals.cat3.inToday += c3.inToday;
      totals.cat3.outToday += c3.outToday;
    }

    const dt = Date.now() - t0;
    await logger.info("getAppleMonitor:success", {
      storageId,
      rows: rows.length,
      ms: dt,
    });
    return { rows, totals };
  } catch (err) {
    const dt = Date.now() - t0;
    await logger.error("getAppleMonitor:error", {
      storageId,
      ms: dt,
      error: String(err?.message || err),
    });
    throw err;
  }
}

/**
 * Последняя операция по яблокам для холодильника
 */
export async function getLastAppleOperation(storageId) {
  const t0 = Date.now();
  try {
    const pool = await connectToDb();

    const typeRs = await pool.request().query(`
      SELECT TOP 1 id FROM dbo.ProductTypes
      WHERE name IN (N'Яблоки', N'apples', N'Apples')
      ORDER BY id ASC;
    `);
    const appleTypeId = typeRs.recordset[0]?.id ?? 1;

    const rs = await pool
      .request()
      .input("storageId", sql.Int, storageId)
      .query(`
        SELECT TOP 1
          o.operation_type,
          o.quantity,
          o.created_at,
          u.login AS performed_by,
          p.name  AS product_name,
          p.is_sorted,
          p.category
        FROM dbo.Operations o
        JOIN dbo.Products p     ON p.id = o.product_id
        JOIN dbo.ProductTypes t ON t.id = p.type_id
        LEFT JOIN dbo.Users u   ON u.id = o.performed_by
        WHERE o.storage_id = @storageId
          AND (t.name IN (N'Яблоки', N'apples', N'Apples') OR t.id = ${appleTypeId})
        ORDER BY o.created_at DESC;
      `);

    const row = rs.recordset[0];
    const dt = Date.now() - t0;

    if (!row) {
      await logger.info("getLastAppleOperation:none", { storageId, ms: dt });
      return null;
    }

    await logger.info("getLastAppleOperation:success", { storageId, ms: dt });
    return {
      type: row.operation_type,
      qty: row.quantity,
      time: row.created_at,
      productName: row.product_name,
      categoryLabel: row.is_sorted ? `Сорт ${row.category}` : "Несортированные",
      user: row.performed_by,
    };
  } catch (err) {
    const dt = Date.now() - t0;
    await logger.error("getLastAppleOperation:error", {
      storageId,
      ms: dt,
      error: String(err?.message || err),
    });
    throw err;
  }
}

/**
 * Единая точка, которую вызывает контроллер
 */
export async function getByStorage(storageId) {
  const [monitor, lastOperation] = await Promise.all([
    getAppleMonitor(storageId),
    getLastAppleOperation(storageId),
  ]);
  return {
    storage: { id: storageId },
    monitor,
    lastOperation,
  };
}
