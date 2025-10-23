// controllers/users.controller.js
import bcrypt from "bcrypt";
import { poolPromise, sql } from "../db.js";
import logger from "../logger.js";

/* ─────────────────────────────────────────────── */
/* 📋 Получить список пользователей (без паролей) */
/* ─────────────────────────────────────────────── */
export async function listUsers(_req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        id,
        login,
        role,
        position,
        department
      FROM Users
      ORDER BY id DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ SQL ERROR in listUsers:", err);
    await logger.error("[users] list_error", { message: err.message });
    res.status(500).json({ message: err.message || "Ошибка при получении пользователей" });
  }
}

/* ─────────────────────────────────────────────── */
/* 👤 Получить одного пользователя по ID */
/* ─────────────────────────────────────────────── */
export async function getUser(req, res) {
  const id = parseInt(req.params.id, 10);
  try {
    const pool = await poolPromise;
    const rs = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT id, login, role, position, department
        FROM Users
        WHERE id = @id
      `);
    if (!rs.recordset.length) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    res.json(rs.recordset[0]);
  } catch (err) {
    console.error("❌ SQL ERROR in getUser:", err);
    await logger.error("[users] get_error", { message: err.message, id });
    res.status(500).json({ message: err.message || "Ошибка при получении пользователя" });
  }
}

/* ─────────────────────────────────────────────── */
/* ➕ Создать пользователя */
/* body: { login, password, role?, position?, department? } */
/* ─────────────────────────────────────────────── */
export async function createUser(req, res) {
  const { login, password, role = "user", position = null, department = null } = req.body || {};
  if (!login || !password) {
    return res.status(400).json({ message: "Поля login и password обязательны" });
  }

  try {
    const pool = await poolPromise;

    // Проверка уникальности логина
    const exist = await pool
      .request()
      .input("login", sql.NVarChar, login)
      .query("SELECT id FROM Users WHERE login = @login");
    if (exist.recordset.length) {
      return res.status(409).json({ message: "Логин уже используется" });
    }

    const hash = await bcrypt.hash(password, 10);

    const rs = await pool
      .request()
      .input("login", sql.NVarChar, login)
      .input("password", sql.VarChar, hash)
      .input("role", sql.NVarChar, role)
      .input("position", sql.NVarChar, position)
      .input("department", sql.NVarChar, department)
      .query(`
        INSERT INTO Users (login, password, role, position, department)
        OUTPUT INSERTED.id, INSERTED.login, INSERTED.role, INSERTED.position, INSERTED.department
        VALUES (@login, @password, @role, @position, @department)
      `);

    const created = rs.recordset[0];
    await logger.info("[users] created", { id: created.id, login });
    res.status(201).json(created);
  } catch (err) {
    console.error("❌ SQL ERROR in createUser:", err);
    await logger.error("[users] create_error", { message: err.message, login });
    res.status(500).json({ message: err.message || "Ошибка при создании пользователя" });
  }
}

/* ─────────────────────────────────────────────── */
/* ✏️ Обновить пользователя (без смены пароля) */
/* body: { login?, role?, position?, department? } */
/* ─────────────────────────────────────────────── */
export async function updateUser(req, res) {
  const id = parseInt(req.params.id, 10);
  const { login, role, position, department } = req.body || {};

  try {
    const pool = await poolPromise;

    if (login) {
      const exist = await pool
        .request()
        .input("login", sql.NVarChar, login)
        .input("id", sql.Int, id)
        .query("SELECT id FROM Users WHERE login = @login AND id <> @id");
      if (exist.recordset.length) {
        return res.status(409).json({ message: "Логин уже используется" });
      }
    }

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("login", sql.NVarChar, login ?? null)
      .input("role", sql.NVarChar, role ?? null)
      .input("position", sql.NVarChar, position ?? null)
      .input("department", sql.NVarChar, department ?? null)
      .query(`
        UPDATE Users SET
          login = COALESCE(@login, login),
          role = COALESCE(@role, role),
          position = COALESCE(@position, position),
          department = COALESCE(@department, department)
        WHERE id = @id
      `);

    const rs = await pool.request().input("id", sql.Int, id).query(`
      SELECT id, login, role, position, department
      FROM Users WHERE id = @id
    `);

    if (!rs.recordset.length) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    await logger.info("[users] updated", { id, login: rs.recordset[0].login });
    res.json(rs.recordset[0]);
  } catch (err) {
    console.error("❌ SQL ERROR in updateUser:", err);
    await logger.error("[users] update_error", { message: err.message, id });
    res.status(500).json({ message: err.message || "Ошибка при обновлении пользователя" });
  }
}

/* ─────────────────────────────────────────────── */
/* 🔑 Сброс пароля */
/* body: { newPassword } */
/* ─────────────────────────────────────────────── */
export async function resetPassword(req, res) {
  const id = parseInt(req.params.id, 10);
  const { newPassword } = req.body || {};

  if (!newPassword) {
    return res.status(400).json({ message: "newPassword обязателен" });
  }

  try {
    const hash = await bcrypt.hash(newPassword, 10);
    const pool = await poolPromise;

    const upd = await pool
      .request()
      .input("id", sql.Int, id)
      .input("pwd", sql.VarChar, hash)
      .query("UPDATE Users SET password = @pwd WHERE id = @id");

    if (!upd.rowsAffected?.[0]) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    await logger.info("[users] reset_password", { id });
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ SQL ERROR in resetPassword:", err);
    await logger.error("[users] reset_password_error", { message: err.message, id });
    res.status(500).json({ message: err.message || "Ошибка при смене пароля" });
  }
}

/* ─────────────────────────────────────────────── */
/* ❌ Удалить пользователя */
/* ─────────────────────────────────────────────── */
export async function deleteUser(req, res) {
  const id = parseInt(req.params.id, 10);
  try {
    const pool = await poolPromise;

    await pool.request().input("id", sql.Int, id).query(`
      DELETE FROM UserPermissions WHERE user_id = @id
    `);

    const del = await pool.request().input("id", sql.Int, id).query(`
      DELETE FROM Users WHERE id = @id
    `);

    if (!del.rowsAffected?.[0]) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    await logger.info("[users] deleted", { id });
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ SQL ERROR in deleteUser:", err);
    await logger.error("[users] delete_error", { message: err.message, id });
    res.status(500).json({ message: err.message || "Ошибка при удалении пользователя" });
  }
}
