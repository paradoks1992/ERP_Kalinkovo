// controllers/productTypes.controller.js
import { sql, connectToDb } from "../db.js";
import logger from "../logger.js";

/* ──────────────────────────────────────────────── */
/* 🍏 1. Публичный список типов продукции (для фронта карщика, бригадира, менеджера) */
/* ──────────────────────────────────────────────── */

/**
 * Возвращает список типов продукции [{ id, name, sortable }]
 * Пример: [{ id: 1, name: "Сортированные", sortable: true }]
 */
export async function getSimpleProductTypes(_req, res) {
  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .query(`
        SELECT id, name, sortable
        FROM ProductTypes
        WHERE is_active = 1
        ORDER BY name ASC
      `);

    res.json(result.recordset);
  } catch (error) {
    await logger.error("[productTypes] simple_list_error", { message: error.message });
    res.status(500).json({ message: "Ошибка при получении списка типов продукции" });
  }
}

/* ──────────────────────────────────────────────── */
/* 🧰 2. Админские функции */
/* ──────────────────────────────────────────────── */

/**
 * Получить все типы продуктов
 */
export async function getProductTypes(_req, res) {
  try {
    const pool = await connectToDb();
    const result = await pool.request().query(`
      SELECT id, name, sortable, is_active, created_at
      FROM ProductTypes
      ORDER BY id DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    await logger.error("[productTypes] list_error", { message: error.message });
    res.status(500).json({ message: "Ошибка при получении типов продуктов" });
  }
}

/**
 * Добавить тип продукта
 */
export async function createProductType(req, res) {
  const { name, sortable = false, is_active = true } = req.body;

  if (!name) return res.status(400).json({ message: "Поле 'name' обязательно" });

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("sortable", sql.Bit, sortable)
      .input("is_active", sql.Bit, is_active)
      .query(`
        INSERT INTO ProductTypes (name, sortable, is_active, created_at)
        OUTPUT INSERTED.*
        VALUES (@name, @sortable, @is_active, GETDATE())
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    await logger.error("[productTypes] create_error", { message: error.message });
    res.status(500).json({ message: "Ошибка при добавлении типа продукта" });
  }
}

/**
 * Обновить тип продукта
 */
export async function updateProductType(req, res) {
  const id = req.params.id;
  const { name, sortable, is_active } = req.body;

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("sortable", sql.Bit, sortable)
      .input("is_active", sql.Bit, is_active)
      .query(`
        UPDATE ProductTypes
        SET 
          name = @name,
          sortable = @sortable,
          is_active = @is_active
        WHERE id = @id;

        SELECT * FROM ProductTypes WHERE id = @id;
      `);

    if (result.recordset.length === 0)
      return res.status(404).json({ message: "Тип продукта не найден" });

    res.json(result.recordset[0]);
  } catch (error) {
    await logger.error("[productTypes] update_error", { message: error.message });
    res.status(500).json({ message: "Ошибка при обновлении типа продукта" });
  }
}

/**
 * Удалить тип продукта
 */
export async function deleteProductType(req, res) {
  const id = req.params.id;

  try {
    const pool = await connectToDb();
    const result = await pool.request().input("id", sql.Int, id).query(`
      DELETE FROM ProductTypes WHERE id = @id
    `);

    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ message: "Тип продукта не найден" });

    res.json({ message: "Тип продукта удалён" });
  } catch (error) {
    await logger.error("[productTypes] delete_error", { message: error.message });
    res.status(500).json({ message: "Ошибка при удалении типа продукта" });
  }
}
