import { sql, connectToDb } from '../db.js';

export const getAdminPanelData = async (req, res) => {
  try {
    const pool = await connectToDb();

    const usersResult = await pool.request().query('SELECT COUNT(*) AS totalUsers FROM Users');
    const productsResult = await pool.request().query('SELECT COUNT(*) AS totalProducts FROM Products');
    const employeesResult = await pool.request().query('SELECT COUNT(*) AS totalEmployees FROM Employees');

    res.json({
      totalUsers: usersResult.recordset[0].totalUsers,
      totalProducts: productsResult.recordset[0].totalProducts,
      totalEmployees: employeesResult.recordset[0].totalEmployees
    });
  } catch (error) {
    console.error('Ошибка при получении данных админ-панели:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
