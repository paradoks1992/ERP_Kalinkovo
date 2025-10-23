// controllers/storageStats.controller.js
import { connectToDb, sql } from "../db.js";

/**
 * Получить сводку по всем холодильникам
 */
export const getStorageStats = async (req, res) => {
  try {
    const pool = await connectToDb();
    const result = await pool.request().query(`
      SELECT 
        ss.id,
        s.name AS storage_name,
        pt.name AS product_type,
        ss.total_in,
        ss.total_out,
        ss.current_stock,
        FORMAT(ss.updated_at, 'dd.MM.yyyy HH:mm') AS updated_at
      FROM StorageStats ss
      JOIN Storages s ON s.id = ss.storage_id
      JOIN ProductTypes pt ON pt.id = ss.product_type_id
      ORDER BY s.name, pt.name;
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("[ERROR] getStorageStats:", err);
    res.status(500).json({ error: "internal_error", message: err.message });
  }
};

/**
 * Обновить одну запись вручную (safe MERGE)
 * current_stock не трогаем — оно вычисляемое в БД.
 */
export const updateStorageStat = async (req, res) => {
  try {
    const { storage_id, product_type_id, total_in, total_out } = req.body;
    if (!storage_id || !product_type_id)
      return res
        .status(400)
        .json({ error: "missing_fields", message: "storage_id и product_type_id обязательны" });

    const pool = await connectToDb();

    const query = `
      MERGE StorageStats AS target
      USING (SELECT @storage_id AS storage_id, @product_type_id AS product_type_id) AS src
      ON target.storage_id = src.storage_id AND target.product_type_id = src.product_type_id
      WHEN MATCHED THEN
        UPDATE SET 
          total_in = ISNULL(@total_in, target.total_in),
          total_out = ISNULL(@total_out, target.total_out),
          updated_at = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (storage_id, product_type_id, total_in, total_out, updated_at)
        VALUES (@storage_id, @product_type_id, @total_in, @total_out, GETDATE());
    `;

    await pool
      .request()
      .input("storage_id", sql.Int, storage_id)
      .input("product_type_id", sql.Int, product_type_id)
      .input("total_in", sql.Int, total_in ?? 0)
      .input("total_out", sql.Int, total_out ?? 0)
      .query(query);

    res.json({ success: true, message: "Статистика успешно обновлена" });
  } catch (err) {
    console.error("[ERROR] updateStorageStat:", err);
    res.status(500).json({ error: "internal_error", message: err.message });
  }
};

/**
 * 🔄 Синхронизация всех холодильников и типов продуктов
 * Создаёт отсутствующие пары, обновляет даты для существующих.
 * current_stock не трогаем.
 */
export const syncAllStorageStats = async (req, res) => {
  try {
    const pool = await connectToDb();

    // Получаем все комбинации холодильников и типов продуктов
    const data = await pool.request().query(`
      SELECT s.id AS storage_id, pt.id AS product_type_id
      FROM Storages s
      CROSS JOIN ProductTypes pt
      WHERE s.is_active = 1 AND pt.is_active = 1;
    `);

    const records = data.recordset || [];
    let inserted = 0,
      updated = 0;

    for (const row of records) {
      if (!row.storage_id || !row.product_type_id) continue;

      const result = await pool
        .request()
        .input("storage_id", sql.Int, row.storage_id)
        .input("product_type_id", sql.Int, row.product_type_id)
        .query(`
          IF EXISTS (
            SELECT 1 FROM StorageStats 
            WHERE storage_id = @storage_id AND product_type_id = @product_type_id
          )
            UPDATE StorageStats
            SET updated_at = GETDATE()
            WHERE storage_id = @storage_id AND product_type_id = @product_type_id;
          ELSE
            INSERT INTO StorageStats (storage_id, product_type_id, total_in, total_out, updated_at)
            VALUES (@storage_id, @product_type_id, 0, 0, GETDATE());
        `);

      if (result.rowsAffected?.[0] > 0) updated++;
      else inserted++;
    }

    res.json({
      success: true,
      message: `Сводка синхронизирована: обновлено ${updated}, добавлено ${inserted}.`,
    });
  } catch (err) {
    console.error("[ERROR] syncAllStorageStats:", err);
    res.status(500).json({ error: "internal_error", message: err.message });
  }
};
