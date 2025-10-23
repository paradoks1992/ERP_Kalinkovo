// scripts/createMonitorUser.js
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import sql from 'mssql';

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

(async () => {
  try {
    console.log('🔄 Подключение к базе данных...');
    await sql.connect(dbConfig);

    const login = 'monitor';
    const plainPassword = 'monitor123';
    const role = 'monitor';

    console.log('🔒 Хешируем пароль...');
    const hashed = await bcrypt.hash(plainPassword, 10);

    const checkUser = await sql.query`
      SELECT * FROM Users WHERE login = ${login}
    `;

    if (checkUser.recordset.length > 0) {
      console.log('⚠️ Пользователь уже существует. Пропускаем создание.');
    } else {
      console.log('👤 Добавляем пользователя...');
      await sql.query`
        INSERT INTO Users (login, password, role)
        VALUES (${login}, ${hashed}, ${role})
      `;
      console.log('✅ Пользователь "monitor" успешно создан.');
    }

    await sql.close();
  } catch (err) {
    console.error('❌ Ошибка при создании пользователя:', err.message);
  }
})();
