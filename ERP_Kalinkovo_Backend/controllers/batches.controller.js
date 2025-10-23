// controllers/batches.controller.js
import { sql, connectToDb } from "../db.js";
import logger from "../logger.js";

/* ──────────────────────────────────────────────── */
/* 📦 1. Админские функции */
/* ──────────────────────────────────────────────── */

export async function getBatches(req, res) {
  try {
    const pool = await connectToDb();
    const result = await pool.request().query(`
      SELECT b.id, b.productId, p.name AS productName, b.quantity, b.createdAt
      FROM Batches b
      JOIN Products p ON b.productId = p.id
      ORDER BY b.createdAt DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    logger.error("Ошибка при получении партий:", error);
    res.status(500).json({ message: "Ошибка при получении партий" });
  }
}

export async function createBatch(req, res) {
  const { productId, quantity } = req.body;

  try {
    const pool = await connectToDb();
    await pool.request()
      .input("productId", sql.Int, productId)
      .input("quantity", sql.Int, quantity)
      .query(`
        INSERT INTO Batches (productId, quantity, createdAt)
        VALUES (@productId, @quantity, GETDATE())
      `);

    res.status(201).json({ message: "Партия добавлена" });
  } catch (error) {
    logger.error("Ошибка при создании партии:", error);
    res.status(500).json({ message: "Ошибка при создании партии" });
  }
}

export async function updateBatch(req, res) {
  const id = req.params.id;
  const { productId, quantity } = req.body;

  try {
    const pool = await connectToDb();
    await pool.request()
      .input("id", sql.Int, id)
      .input("productId", sql.Int, productId)
      .input("quantity", sql.Int, quantity)
      .query(`
        UPDATE Batches
        SET productId = @productId, quantity = @quantity
        WHERE id = @id
      `);

    res.json({ message: "Партия обновлена" });
  } catch (error) {
    logger.error("Ошибка при обновлении партии:", error);
    res.status(500).json({ message: "Ошибка при обновлении партии" });
  }
}

export async function deleteBatch(req, res) {
  const id = req.params.id;

  try {
    const pool = await connectToDb();
    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Batches WHERE id = @id");

    res.json({ message: "Партия удалена" });
  } catch (error) {
    logger.error("Ошибка при удалении партии:", error);
    res.status(500).json({ message: "Ошибка при удалении партии" });
  }
}

/* ──────────────────────────────────────────────── */
/* 🚜 2. Операции карщика (ввоз / вывоз) */
/* ──────────────────────────────────────────────── */

/**
 * Ввоз продукции на склад
 * POST /api/batches/inbound
 */
export async function inboundBatch(req, res) {
  const { storageId, productTypeId, productId, category, qty } = req.body;
  const userId = req.user?.id;

  if (!storageId || !productTypeId || !productId || !qty) {
    return res.status(400).json({ message: "Неполные данные для ввоза" });
  }

  try {
    const pool = await connectToDb();
    await pool.request()
      .input("storageId", sql.Int, storageId)
      .input("productTypeId", sql.Int, productTypeId)
      .input("productId", sql.Int, productId)
      .input("category", sql.Int, category || null)
      .input("qty", sql.Int, qty)
      .input("userId", sql.Int, userId)
      .query(`
        INSERT INTO Batches (storageId, productTypeId, productId, category, quantity, operationType, userId, createdAt)
        VALUES (@storageId, @productTypeId, @productId, @category, @qty, 'inbound', @userId, GETDATE())
      `);

    res.json({ ok: true });
  } catch (error) {
    logger.error("Ошибка при ввозе:", error);
    res.status(500).json({ message: "Ошибка при ввозе" });
  }
}

/**
 * Вывоз продукции со склада
 * POST /api/batches/outbound
 */
export async function outboundBatch(req, res) {
  const { storageId, productTypeId, productId, category, qty, to, carNumber, note } = req.body;
  const userId = req.user?.id;

  if (!storageId || !productTypeId || !productId || !qty) {
    return res.status(400).json({ message: "Неполные данные для вывоза" });
  }

  try {
    const pool = await connectToDb();

    // Проверка остатка
    const check = await pool.request()
      .input("storageId", sql.Int, storageId)
      .input("productTypeId", sql.Int, productTypeId)
      .input("productId", sql.Int, productId)
      .input("category", sql.Int, category || null)
      .query(`
        SELECT SUM(CASE WHEN operationType='inbound' THEN quantity ELSE -quantity END) AS available
        FROM Batches
        WHERE storageId=@storageId AND productTypeId=@productTypeId
          AND productId=@productId AND (category=@category OR @category IS NULL)
      `);

    const available = check.recordset[0]?.available || 0;
    if (available < qty) {
      return res.status(400).json({
        message: `Недостаточно товара. Остаток: ${available}, запрошено: ${qty}`
      });
    }

    await pool.request()
      .input("storageId", sql.Int, storageId)
      .input("productTypeId", sql.Int, productTypeId)
      .input("productId", sql.Int, productId)
      .input("category", sql.Int, category || null)
      .input("qty", sql.Int, qty)
      .input("to", sql.NVarChar, to || null)
      .input("carNumber", sql.NVarChar, carNumber || null)
      .input("note", sql.NVarChar, note || null)
      .input("userId", sql.Int, userId)
      .query(`
        INSERT INTO Batches (storageId, productTypeId, productId, category, quantity, operationType, destination, carNumber, note, userId, createdAt)
        VALUES (@storageId, @productTypeId, @productId, @category, @qty, 'outbound', @to, @carNumber, @note, @userId, GETDATE())
      `);

    res.json({ ok: true });
  } catch (error) {
    logger.error("Ошибка при вывозе:", error);
    res.status(500).json({ message: "Ошибка при вывозе" });
  }
}
