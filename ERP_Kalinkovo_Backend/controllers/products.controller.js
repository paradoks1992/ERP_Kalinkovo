// controllers/products.controller.js
import { sql, connectToDb } from "../db.js";
import logger from "../logger.js";

/* ──────────────────────────────────────────────── */
/* 🍏 1. Публичный список сортов для всех ролей */
/* ──────────────────────────────────────────────── */

/**
 * Возвращает список активных сортов [{ id, name }]
 * Используется карщиком, бригадиром, менеджером
 */
export async function getSimpleProducts(_req, res) {
  try {
    const pool = await connectToDb();
    const result = await pool.request().query(`
      SELECT id, name
      FROM Products
      WHERE is_active = 1
      ORDER BY name ASC
    `);
    res.json(result.recordset);
  } catch (error) {
    await logger.error("[products] simple_list_error", { message: error.message });
    res.status(500).json({ message: "Ошибка при получении списка сортов" });
  }
}

/* ──────────────────────────────────────────────── */
/* 🧰 2. Полный список и CRUD для админки */
/* ──────────────────────────────────────────────── */

/**
 * Получить все продукты (с типом и активностью)
 */
export async function getProducts(_req, res) {
  try {
    const pool = await connectToDb();
    const result = await pool.request().query(`
      SELECT 
        p.id, 
        p.name, 
        p.productTypeId,
        pt.name AS productTypeName,
        p.is_active,
        FORMAT(p.created_at, 'dd.MM.yyyy, HH:mm:ss') AS created_at
      FROM Products p
      LEFT JOIN ProductTypes pt ON p.productTypeId = pt.id
      ORDER BY p.id DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    await logger.error("[products] list_error", { message: error.message });
    res.status(500).json({ message: "Ошибка при получении списка продуктов" });
  }
}

/**
 * Добавить новый продукт (сорт яблок)
 */
export async function createProduct(req, res) {
  const { name, productTypeId, is_active = true } = req.body;

  if (!name || !productTypeId)
    return res.status(400).json({ message: "Название и тип продукта обязательны" });

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input("name", sql.NVarChar(255), name)
      .input("productTypeId", sql.Int, productTypeId)
      .input("is_active", sql.Bit, is_active)
      .query(`
        INSERT INTO Products (name, productTypeId, is_active, created_at)
        OUTPUT INSERTED.*
        VALUES (@name, @productTypeId, @is_active, GETDATE())
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    await logger.error("[products] create_error", { message: error.message });
    res.status(500).json({ message: "Ошибка при добавлении продукта" });
  }
}

/**
 * Обновить продукт
 */
export async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, productTypeId, is_active } = req.body;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar(255), name)
      .input("productTypeId", sql.Int, productTypeId)
      .input("is_active", sql.Bit, is_active)
      .query(`
        UPDATE Products
        SET 
          name = @name,
          productTypeId = @productTypeId,
          is_active = @is_active
        WHERE id = @id;

        SELECT * FROM Products WHERE id = @id;
      `);

    if (result.recordset.length === 0)
      return res.status(404).json({ message: "Продукт не найден" });

    res.json(result.recordset[0]);
  } catch (error) {
    await logger.error("[products] update_error", { message: error.message });
    res.status(500).json({ message: "Ошибка при обновлении продукта" });
  }
}

/**
 * Удалить продукт
 */
export async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    const pool = await connectToDb();
    const result = await pool.request().input("id", sql.Int, id).query(`
      DELETE FROM Products WHERE id = @id
    `);

    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ message: "Продукт не найден" });

    res.json({ message: "Продукт удалён" });
  } catch (error) {
    await logger.error("[products] delete_error", { message: error.message });
    res.status(500).json({ message: "Ошибка при удалении продукта" });
  }
}
