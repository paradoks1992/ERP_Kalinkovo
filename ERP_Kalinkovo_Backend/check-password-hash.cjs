const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

console.log('🔐 Проверка хешей паролей...');

db.all("SELECT username, password FROM users", (err, users) => {
  if (err) {
    console.error('❌ Ошибка:', err);
    return;
  }
  
  console.log('👥 Пользователи и хеши паролей:');
  users.forEach(user => {
    console.log(`  👤 ${user.username}`);
    console.log(`     Пароль в базе: ${user.password}`);
    console.log(`     Длина: ${user.password ? user.password.length : 'null'} символов`);
    console.log(`     Похож на хеш: ${user.password && user.password.length > 10 ? '✅ Да' : '❌ Нет'}`);
    console.log('---');
  });
  
  db.close();
});