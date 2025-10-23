const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

console.log('🔐 Проверка паролей пользователей...');

db.all("SELECT username, password FROM users", (err, users) => {
  if (err) {
    console.error('❌ Ошибка:', err);
    return;
  }
  
  console.log('👥 Пользователи и пароли:');
  users.forEach(user => {
    console.log(`  👤 ${user.username} / ${user.password}`);
  });
  
  db.close();
});