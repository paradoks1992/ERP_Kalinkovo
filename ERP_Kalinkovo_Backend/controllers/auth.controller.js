// controllers/auth.controller.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sql, connectToDb } from "../db.js";

/**
 * Настройки из env
 */
const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "7d";
const MONITOR_SECRET = process.env.MONITOR_SECRET || ""; // 🔐 общий секрет для монитор-логина

/**
 * Генерация пары токенов (access + refresh)
 */
function generateTokens(user) {
  const payload = {
    id: user.id,
    login: user.login,
    role: user.role,
    ...(user.storage_id ? { storage_id: user.storage_id } : {}),
  };

  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });

  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });

  return { accessToken, refreshToken };
}

/**
 * POST /api/auth/login
 * body: { login, password }
 */
export async function login(req, res) {
  const { login, password } = req.body || {};

  if (!login || !password) {
    return res.status(400).json({ message: "Введите логин и пароль" });
  }

  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input("login", sql.NVarChar, login)
      .query(`
        SELECT id, login, password, role, position, department
        FROM dbo.Users
        WHERE login = @login
      `);

    if (!result?.recordset?.length) {
      return res.status(401).json({ message: "Неверный логин или пароль" });
    }

    const user = result.recordset[0];

    // Проверяем хэш пароля
    const ok = await bcrypt.compare(password, user.password || "");
    if (!ok) {
      return res.status(401).json({ message: "Неверный логин или пароль" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    return res.json({
      message: "Успешный вход",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        login: user.login,
        role: user.role,
        position: user.position,
        department: user.department,
      },
    });
  } catch (err) {
    console.error("[LOGIN ERROR]", err);
    return res
      .status(500)
      .json({ message: "Ошибка авторизации", details: err.message });
  }
}

/**
 * POST /api/auth/refresh
 */
export async function refreshToken(req, res) {
  const token =
    req.body?.refresh_token || req.body?.token || req.body?.refreshToken;

  if (!token) {
    return res.status(400).json({ message: "Отсутствует refresh_token" });
  }

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);

    const { accessToken, refreshToken } = generateTokens({
      id: decoded.id,
      login: decoded.login,
      role: decoded.role,
      storage_id: decoded.storage_id,
    });

    return res.json({
      message: "Токен обновлён",
      accessToken,
      refreshToken,
      user: {
        id: decoded.id,
        login: decoded.login,
        role: decoded.role,
        storage_id: decoded.storage_id || null,
      },
    });
  } catch (error) {
    console.error("[REFRESH ERROR]", error);
    return res
      .status(403)
      .json({ message: "Недействительный или истёкший refresh_token" });
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(_req, res) {
  return res.json({ ok: true });
}

/**
 * 🚀 POST /api/auth/monitor-login
 */
export async function monitorLogin(req, res) {
  try {
    const { code, secret } = req.body || {};

    if (!code || !secret) {
      return res.status(400).json({ message: "code и secret обязательны" });
    }
    if (!MONITOR_SECRET) {
      return res.status(500).json({ message: "MONITOR_SECRET не настроен на сервере" });
    }
    if (secret !== MONITOR_SECRET) {
      return res.status(403).json({ message: "Неверный secret" });
    }

    const pool = await connectToDb();
    const rs = await pool
      .request()
      .input("code", sql.NVarChar, String(code).trim())
      .query(`
        SELECT TOP 1 id, name
        FROM dbo.Storages
        WHERE RTRIM(LTRIM(name)) = @code
      `);

    if (!rs.recordset?.length) {
      return res.status(404).json({ message: "Холодильник не найден" });
    }

    const storage = rs.recordset[0];

    const monitorUser = {
      id: 0,
      login: `monitor_${storage.name}`,
      role: "monitor",
      storage_id: storage.id,
    };

    const { accessToken, refreshToken } = generateTokens(monitorUser);

    return res.json({
      message: "Монитор авторизован",
      accessToken,
      refreshToken,
      user: {
        id: 0,
        login: monitorUser.login,
        role: "monitor",
        storage_id: storage.id,
      },
    });
  } catch (err) {
    console.error("[MONITOR LOGIN ERROR]", err);
    return res.status(500).json({ message: "Ошибка авторизации монитора" });
  }
}
