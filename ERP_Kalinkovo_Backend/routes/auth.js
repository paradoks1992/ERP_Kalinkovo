// routes/auth.js
import { Router } from "express";
import {
  login,
  refreshToken,
  logout,
  monitorLogin, // 🔥 добавлено
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

/**
 * Вход: выдает пару токенов + пользователя
 * body: { login, password }
 */
router.post("/login", login);

/**
 * 🔐 Технический вход мониторного экрана без пароля
 * body: { code, secret } — code = имя холодильника (например, "7A"), secret = MONITOR_SECRET
 */
router.post("/monitor-login", monitorLogin);

/**
 * Обновление access-токена по refresh-токену
 * body: { refresh_token } | { token } | { refreshToken }
 */
router.post("/refresh", refreshToken);

/**
 * Проверка валидности текущего access-токена
 * header: Authorization: Bearer <accessToken>
 */
router.get("/check", verifyToken, (req, res) => {
  return res.json({
    ok: true,
    user: req.user ?? null,
  });
});

/**
 * Выход: при необходимости инвалидируем refresh в БД/кэше (пока no-op)
 */
router.post("/logout", logout);

export default router;
