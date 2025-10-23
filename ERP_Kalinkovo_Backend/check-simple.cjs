const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

console.log('🔍 Проверка базы данных...');

// Проверяем таблицы
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('❌ Ошибка:', err);
    return;
  }
  
  console.log('📋 Таблицы в базе:');
  tables.forEach(table => console.log('  - ' + table.name));
  
  // Проверяем пользователей
  db.all("SELECT * FROM users", (err, users) => {
    if (err) {
      console.log('❌ Таблица users не существует или ошибка:', err.message);
    } else if (users.length === 0) {
      console.log('❌ В таблице users нет записей!');
      console.log('💡 Нужно создать пользователей!');
    } else {
      console.log('👥 Пользователи:');
      users.forEach(user => {
        console.log(`  👤 ${user.username || user.name} - ${user.email} - ${user.roles}`);
      });
    }
    
    db.close();
  });
});