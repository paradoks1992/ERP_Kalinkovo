// middleware/authorizePermission.js
import { poolPromise, sql } from "../db.js";
import logger from "../logger.js";

/**
 * Проверяет, есть ли у пользователя право выполнять действие (permission_key)
 */
export function authorizePermission(requiredPermissionKey) {
  return async function (req, res, next) {
    try {
      const user = req.user;
      if (!user || !user.id) {
        return res.status(401).json({ message: "Неавторизовано" });
      }

      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("userId", sql.Int, user.id)
        .input("permKey", sql.NVarChar, requiredPermissionKey)
        .query(`
          SELECT p.permission_key, up.is_allowed
          FROM UserPermissions up
          JOIN Permissions p ON p.id = up.permission_id
          WHERE up.user_id = @userId
            AND p.permission_key = @permKey
        `);

      if (result.recordset.length === 0) {
        await logger.warn(`[AUTHZ] ❌ ${user.name || user.login} → нет доступа (${requiredPermissionKey})`);
        return res.status(403).json({ message: "Доступ запрещён" });
      }

      const { is_allowed } = result.recordset[0];
      if (!is_allowed) {
        await logger.warn(`[AUTHZ] 🚫 ${user.name || user.login} → право запрещено (${requiredPermissionKey})`);
        return res.status(403).json({ message: "Доступ запрещён" });
      }

      await logger.info(`[AUTHZ] ✅ ${user.name || user.login} получил доступ: ${requiredPermissionKey}`);
      next();
    } catch (err) {
      await logger.error("[AUTHZ ERROR]", { message: err.message, stack: err.stack });
      res.status(500).json({ message: "Ошибка проверки разрешений" });
    }
  };
}
