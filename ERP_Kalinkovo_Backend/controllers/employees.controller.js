import { sql, connectToDb } from '../db.js';

// �������� ���� �����������
export const getAllEmployees = async (req, res) => {
  try {
    const pool = await connectToDb();
    const result = await pool.request().query('SELECT * FROM Employees');
    res.json(result.recordset);
  } catch (error) {
    console.error('������ ��� ��������� �����������:', error);
    res.status(500).json({ error: '������ �������' });
  }
};

// �������� ������ ����������
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

    res.status(201).json({ message: '��������� ��������' });
  } catch (error) {
    console.error('������ ��� ���������� ����������:', error);
    res.status(500).json({ error: '������ �������' });
  }
};

// �������� ����������
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

    res.json({ message: '��������� �������' });
  } catch (error) {
    console.error('������ ��� ���������� ����������:', error);
    res.status(500).json({ error: '������ �������' });
  }
};

// ������� ����������
export const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await connectToDb();
    await pool.request()
      .input('Id', sql.Int, id)
      .query('DELETE FROM Employees WHERE Id = @Id');

    res.json({ message: '��������� �����' });
  } catch (error) {
    console.error('������ ��� �������� ����������:', error);
    res.status(500).json({ error: '������ �������' });
  }
};
