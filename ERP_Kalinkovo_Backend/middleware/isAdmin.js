// middleware/isAdmin.js
import logger from "../logger.js";

/**
 * Проверяет, является ли пользователь администратором
 */
export function isAdmin(req, res, next) {
  try {
    const role = String(req.user?.role || "").toLowerCase();

    if (role !== "admin") {
      logger.warn(`[ADMIN CHECK] ❌ ${req.user?.name} → не админ`);
      return res.status(403).json({ message: "Только для администраторов" });
    }

    logger.info(`[ADMIN CHECK] ✅ ${req.user?.name} подтверждён как администратор`);
    next();
  } catch (err) {
    logger.error("[ADMIN CHECK ERROR]", err);
    res.status(500).json({ message: "Ошибка проверки прав администратора" });
  }
}
