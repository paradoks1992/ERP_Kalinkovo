import { sql, connectToDb } from '../db.js';

// Получить всех сотрудников
export const getAllEmployees = async (req, res) => {
  try {
    const pool = await connectToDb();
    const result = await pool.request().query('SELECT * FROM Employees');
    res.json(result.recordset);
  } catch (error) {
    console.error('Ошибка при получении сотрудников:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Добавить нового сотрудника
export const addEmployee = async (req, res) => {
  const { name, position, department } = req.body;

  try {
    const pool = await connectToDb();
    await pool.request()
      .input('Name', sql.NVarChar, name)
      .input('Position', sql.NVarChar, position)
      .input('Department', sql.NVarChar, department)
      .query(`
        INSERT INTO Employees (Name, Position, Department)
        VALUES (@Name, @Position, @Department)
      `);

    res.status(201).json({ message: 'Сотрудник добавлен' });
  } catch (error) {
    console.error('Ошибка при добавлении сотрудника:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновить сотрудника
export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, position, department } = req.body;

  try {
    const pool = await connectToDb();
    await pool.request()
      .input('Id', sql.Int, id)
      .input('Name', sql.NVarChar, name)
      .input('Position', sql.NVarChar, position)
      .input('Department', sql.NVarChar, department)
      .query(`
        UPDATE Employees
        SET Name = @Name, Position = @Position, Department = @Department
        WHERE Id = @Id
      `);

    res.json({ message: 'Сотрудник обновлён' });
  } catch (error) {
    console.error('Ошибка при обновлении сотрудника:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удалить сотрудника
export const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await connectToDb();
    await pool.request()
      .input('Id', sql.Int, id)
      .query('DELETE FROM Employees WHERE Id = @Id');

    res.json({ message: 'Сотрудник удалён' });
  } catch (error) {
    console.error('Ошибка при удалении сотрудника:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
