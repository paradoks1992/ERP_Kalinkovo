// controllers/storages.controller.js
import { poolPromise, sql } from "../db.js";
import logger from "../logger.js";

/* ──────────────────────────────────────────────── */
/* 📦 1. Краткий список холодильников (для карщика / менеджера) */
/* ──────────────────────────────────────────────── */

/**
 * Возвращает [{ id, name }] активных холодильников.
 * Используется на фронте карщика / менеджера.
 */
export const getSimpleStoragesList = async (_req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT id, name
      FROM Storages
      WHERE is_active = 1
      ORDER BY name ASC
    `);
    res.json(result.recordset);
  } catch (error) {
    await logger.error("[storages] simple_list_error", { message: error.message });
    res.status(500).json({ message: "Ошибка при получении списка холодильников" });
  }
};

/* ──────────────────────────────────────────────── */
/* 🧰 2. Полный CRUD для админки */
/* ──────────────────────────────────────────────── */

/**
 * Получить список всех холодильников
 */
export const getStorages = async (_req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        id,
        name,
        type,
        is_active,
        show_temperature,
        FORMAT(created_at, 'dd.MM.yyyy, HH:mm:ss') AS created_at
      FROM Storages
      ORDER BY id DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    await logger.error("[storages] list_error", { message: error.message });
    res.status(500).json({ message: "Ошибка при получении холодильников" });
  }
};

/**
 * Получить холодильник по ID
 */
export const getStorageById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT id, name, type, is_active, show_temperature, created_at
        FROM Storages
        WHERE id = @id
      `);

    if (result.recordset.length === 0)
      return res.status(404).json({ message: "Холодильник не найден" });

    res.json(result.recordset[0]);
  } catch (error) {
    await logger.error("[storages] get_error", { message: error.message });
    res.status(500).json({ message: "Ошибка при получении холодильника" });
  }
};

/**
 * Создать новый холодильник
 */
export const createStorage = async (req, res) => {
  try {
    const { name, type, is_active = true, show_temperature = false } = req.body;

    if (!name || !type)
      return res.status(400).json({ message: "Название и тип обязательны" });

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("name", sql.NVarChar(255), name)
      .input("type", sql.NVarChar(50), type)
      .input("is_active", sql.Bit, is_active)
      .input("show_temperature", sql.Bit, show_temperature)
      .query(`
        INSERT INTO Storages (name, type, is_active, show_temperature, created_at)
        OUTPUT INSERTED.*
        VALUES (@name, @type, @is_active, @show_temperature, GETDATE())
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    await logger.error("[storages] create_error", { message: error.message });
    res.status(500).json({ message: "Ошибка при создании холодильника" });
  }
};

/**
 * Обновить холодильник
 */
export const updateStorage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, is_active, show_temperature } = req.body;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar(255), name)
      .input("type", sql.NVarChar(50), type)
      .input("is_active", sql.Bit, is_active)
      .input("show_temperature", sql.Bit, show_temperature)
      .query(`
        UPDATE Storages
        SET 
          name = @name,
          type = @type,
          is_active = @is_active,
          show_temperature = @show_temperature
        WHERE id = @id;

        SELECT * FROM Storages WHERE id = @id;
      `);

    if (result.recordset.length === 0)
      return res.status(404).json({ message: "Холодильник не найден" });

    res.json(result.recordset[0]);
  } catch (error) {
    await logger.error("[storages] update_error", { message: error.message });
    res.status(500).json({ message: "Ошибка при обновлении холодильника" });
  }
};

/**
 * Удалить холодильник
 */
export const deleteStorage = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Storages WHERE id = @id");

    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ message: "Холодильник не найден" });

    res.json({ message: "Холодильник удалён" });
  } catch (error) {
    await logger.error("[storages] delete_error", { message: error.message });
    res.status(500).json({ message: "Ошибка при удалении холодильника" });
  }
};
