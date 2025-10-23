import { poolPromise, sql } from "../db.js";
import logger from "../logger.js";

/* ──────────────────────────────────────────────── */
/* 📘 Пользовательские разрешения */
/* ──────────────────────────────────────────────── */

export async function getAllPermissions(_req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT id, name, description, key_name AS permission_key
      FROM Permissions
      ORDER BY id
    `);
    res.json(result.recordset);
    await logger.info("permissions:list_all");
  } catch (err) {
    await logger.error("permissions:list_all_error", { error: err.message });
    res.status(500).json({ error: "Ошибка при получении разрешений" });
  }
}

export async function getUserPermissions(req, res) {
  const userId = req.params.id;
  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ error: "Некорректный идентификатор пользователя" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT p.id, p.name, p.key_name AS permission_key, up.is_allowed
        FROM UserPermissions up
        JOIN Permissions p ON up.permission_id = p.id
        WHERE up.user_id = @userId
      `);

    res.json(result.recordset);
    await logger.info("permissions:user_list", { userId, count: result.recordset.length });
  } catch (err) {
    await logger.error("permissions:user_list_error", { error: err.message, userId });
    res.status(500).json({ error: "Ошибка при получении разрешений пользователя" });
  }
}

export async function updateUserPermissions(req, res) {
  const userId = req.params.id;
  const { permissions } = req.body;

  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ error: "Некорректный идентификатор пользователя" });
  }

  if (!Array.isArray(permissions)) {
    return res.status(400).json({ error: "permissions должен быть массивом ID разрешений" });
  }

  const pool = await poolPromise;
  const tx = new sql.Transaction(pool);

  try {
    await tx.begin();

    const request = new sql.Request(tx);
    await request
      .input("userId", sql.Int, userId)
      .query("DELETE FROM UserPermissions WHERE user_id = @userId");

    for (const permId of permissions) {
      if (!permId || isNaN(Number(permId))) continue; // защита от мусора в массиве
      const insert = new sql.Request(tx);
      await insert
        .input("userId", sql.Int, userId)
        .input("permId", sql.Int, permId)
        .query(`
          INSERT INTO UserPermissions (user_id, permission_id, is_allowed)
          VALUES (@userId, @permId, 1)
        `);
    }

    await tx.commit();
    await logger.info("permissions:user_update", { userId, count: permissions.length });
    res.json({ message: "Права пользователя успешно обновлены" });
  } catch (err) {
    try {
      await tx.rollback();
    } catch {}
    await logger.error("permissions:user_update_error", { error: err.message, userId });
    res.status(500).json({ error: "Ошибка при обновлении разрешений пользователя" });
  }
}

/* ──────────────────────────────────────────────── */
/* 🔥 Ролевая матрица разрешений */
/* ──────────────────────────────────────────────── */

export async function getRoleMatrix(_req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT role, permission_key AS [key], is_allowed
      FROM RolePermissions
      ORDER BY role, permission_key
    `);

    const matrix = {};
    for (const row of result.recordset) {
      if (!matrix[row.role]) matrix[row.role] = {};
      matrix[row.role][row.key] = !!row.is_allowed;
    }

    res.json(matrix);
    await logger.info("permissions:roles_list");
  } catch (err) {
    await logger.error("permissions:roles_list_error", { error: err.message });
    res.status(500).json({ error: "Ошибка при получении прав по ролям" });
  }
}

export async function updateRoleMatrix(req, res) {
  const data = req.body;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return res.status(400).json({ error: "Неверный формат данных" });
  }

  const pool = await poolPromise;
  const tx = new sql.Transaction(pool);

  try {
    await tx.begin();
    await new sql.Request(tx).query("DELETE FROM RolePermissions");

    for (const [role, perms] of Object.entries(data)) {
      for (const [key, allowed] of Object.entries(perms)) {
        if (!key) continue;
        await new sql.Request(tx)
          .input("role", sql.NVarChar, role)
          .input("permission_key", sql.NVarChar, key)
          .input("is_allowed", sql.Bit, allowed ? 1 : 0)
          .query(`
            INSERT INTO RolePermissions (role, permission_key, is_allowed, updated_at)
            VALUES (@role, @permission_key, @is_allowed, GETDATE())
          `);
      }
    }

    await tx.commit();
    await logger.info("permissions:roles_update", { roles: Object.keys(data).length });
    res.json({ message: "Права по ролям успешно обновлены" });
  } catch (err) {
    try {
      await tx.rollback();
    } catch {}
    await logger.error("permissions:roles_update_error", { error: err.message });
    res.status(500).json({ error: "Ошибка при обновлении прав по ролям" });
  }
}

export async function getAllKeys(_req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT DISTINCT permission_key AS [key]
      FROM RolePermissions
      ORDER BY permission_key
    `);
    res.json(result.recordset.map((r) => r.key));
    await logger.info("permissions:keys_list");
  } catch (err) {
    await logger.error("permissions:keys_error", { error: err.message });
    res.status(500).json({ error: "Ошибка при получении списка ключей" });
  }
}

/* ──────────────────────────────────────────────── */
/* 👤 Права текущего авторизованного пользователя */
/* ──────────────────────────────────────────────── */

export async function getCurrentUserPermissions(req, res) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Не авторизован" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT p.key_name AS permission_key
        FROM UserPermissions up
        JOIN Permissions p ON p.id = up.permission_id
        WHERE up.user_id = @userId AND up.is_allowed = 1
      `);

    const perms = result.recordset.map((r) => r.permission_key);
    res.json(perms);
    await logger.info("permissions:current_user", { userId, count: perms.length });
  } catch (err) {
    await logger.error("permissions:current_user_error", { error: err.message, userId });
    res.status(500).json({ error: "Ошибка при получении прав текущего пользователя" });
  }
}

/* ──────────────────────────────────────────────── */
/* 🔄 Синхронизация прав пользователей с ролями */
/* ──────────────────────────────────────────────── */

export async function syncRolePermissionsToUsers(req, res) {
  const admin = req.user?.login || req.user?.name || "unknown";

  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      MERGE UserPermissions AS target
      USING (
        SELECT u.id AS user_id, p.id AS permission_id, rp.is_allowed
        FROM Users u
        JOIN RolePermissions rp ON rp.role = u.role
        JOIN Permissions p ON p.key_name = rp.permission_key
      ) AS source
      ON target.user_id = source.user_id AND target.permission_id = source.permission_id
      WHEN MATCHED THEN UPDATE SET target.is_allowed = source.is_allowed
      WHEN NOT MATCHED BY TARGET THEN
        INSERT (user_id, permission_id, is_allowed)
        VALUES (source.user_id, source.permission_id, source.is_allowed)
      WHEN NOT MATCHED BY SOURCE THEN
        DELETE;
      SELECT @@ROWCOUNT AS affected;
    `);

    const updated = result.recordset?.[0]?.affected || 0;

    await logger.info("permissions:sync", { updated, admin });
    await logger.notifyInfo(`🔁 Permissions sync started by *${admin}*\nОбновлено записей: *${updated}*`);

    res.json({ message: "Синхронизация выполнена", updated });
  } catch (err) {
    await logger.error("permissions:sync_error", { error: err.message, admin });
    res.status(500).json({ error: "Ошибка при синхронизации прав пользователей" });
  }
}
