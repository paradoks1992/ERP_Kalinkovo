const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('database.sqlite');

console.log('🔐 Хеширование паролей...');

const users = [
  { username: 'driver', plainPassword: 'Driver123!' },
  { username: 'foreman', plainPassword: 'Foreman123!' },
  { username: 'admin', plainPassword: 'Admin123!' },
  { username: 'manager', plainPassword: 'Manager123!' }
];

let completed = 0;

function updateUserPassword(user) {
  bcrypt.hash(user.plainPassword, 10, (err, hash) => {
    if (err) {
      console.error(`❌ Ошибка хеширования для ${user.username}:`, err);
      return;
    }
    
    db.run(
      "UPDATE users SET password = ? WHERE username = ?",
      [hash, user.username],
      function(err) {
        if (err) {
          console.error(`❌ Ошибка обновления для ${user.username}:`, err);
        } else {
          console.log(`✅ Пароль хеширован для ${user.username}`);
          console.log(`   Исходный: ${user.plainPassword}`);
          console.log(`   Хеш: ${hash.substring(0, 20)}...`);
        }
        
        completed++;
        if (completed === users.length) {
          console.log('\n🎉 Все пароли хешированы!');
          console.log('👤 driver / Driver123!');
          console.log('👷 foreman / Foreman123!');
          console.log('👑 admin / Admin123!');
          console.log('💼 manager / Manager123!');
          db.close();
        }
      }
    );
  });
}

// Хешируем пароли по очереди
users.forEach(user => {
  updateUserPassword(user);
});