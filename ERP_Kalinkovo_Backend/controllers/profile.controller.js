import { sql, connectToDb } from '../db.js';

export async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const pool = await connectToDb();
    const result = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query('SELECT id, login, role, position, department FROM Users WHERE id = @userId');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}
