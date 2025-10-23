// middleware/verifyToken.js
import jwt from "jsonwebtoken";
import logger from "../logger.js";

/**
 * Проверяет JWT-токен в заголовке Authorization: Bearer <token>
 * Если токен валиден — добавляет в req.user объект пользователя
 */
export function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      logger.warn("[AUTH] Нет токена — доступ запрещён");
      return res.status(401).json({ message: "Нет токена. Доступ запрещён." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        logger.warn("[AUTH] Невалидный токен");
        return res.status(403).json({ message: "Невалидный токен" });
      }

      // ✅ Сохраняем данные о пользователе
      req.user = {
        id: user.id,
        name: user.name,
        role: user.role || "user",
      };

      logger.info(`[AUTH] ✅ Пользователь ${user.name || user.id} успешно авторизован`);
      next();
    });
  } catch (err) {
    logger.error("[AUTH ERROR]", err);
    res.status(500).json({ message: "Ошибка при проверке токена" });
  }
}
