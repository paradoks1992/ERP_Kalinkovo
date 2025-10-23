// utils/authz.js
// Утилиты для централизованной проверки прав

import sql from "../db.js";
import logger from "../logger.js";

/**
 * Проверка разрешения у пользователя (вне Express)
 * Используется в контроллерах, если нет middleware
 */
export async function hasPermission(userId, permissionKey) {
  try {
    const result = await sql.query`
      SELECT up.is_allowed
      FROM UserPermissions up
      JOIN Permissions p ON p.id = up.permission_id
      WHERE up.user_id = ${userId}
        AND p.permission_key = ${permissionKey}
    `;
    return result.recordset.length > 0 && result.recordset[0].is_allowed;
  } catch (err) {
    logger.error("[AUTHZ UTILITY ERROR]", err);
    return false;
  }
}

/**
 * Проверка роли пользователя
 */
export function isUserAdmin(user) {
  return String(user?.role || "").toLowerCase() === "admin";
}
