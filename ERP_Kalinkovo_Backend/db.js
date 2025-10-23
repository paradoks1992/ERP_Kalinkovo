// db.js — надёжное самовосстанавливающееся подключение к MSSQL + Telegram уведомления
import sql from "mssql";
import dotenv from "dotenv";
import logger from "./logger.js";

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "1433", 10),
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    useUTC: true,
    tdsVersion: "7_4",
    connectionIsolationLevel: sql.ISOLATION_LEVEL.READ_COMMITTED,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool;
let isConnecting = false;
let lastConnectTime = null;
let lastDbDownAt = null;

/**
 * Подключение с авто-реконнектом и логированием
 */
export async function connectToDb() {
  if (pool && pool.connected) return pool;
  if (isConnecting) {
    await new Promise((res) => setTimeout(res, 1000));
    return connectToDb();
  }

  try {
    isConnecting = true;
    const start = Date.now();
    pool = await sql.connect(config);
    const ms = Date.now() - start;
    lastConnectTime = new Date();

    // если до этого была ошибка соединения — восстановление
    if (lastDbDownAt) {
      const downtime = Date.now() - lastDbDownAt;
      lastDbDownAt = null;
      await logger.dbRecovery(downtime);
    } else {
      await logger.info("db_connected", `✅ MSSQL подключен (${ms} ms): ${config.server}/${config.database}`);
    }

    pool.on("error", async (err) => {
      await logger.error("db_pool_error", { message: err.message });
      await reconnect();
    });

    isConnecting = false;
    return pool;
  } catch (err) {
    isConnecting = false;
    lastDbDownAt = Date.now();
    await logger.dbDown(err.message);
    await new Promise((res) => setTimeout(res, 5000));
    return connectToDb();
  }
}

/**
 * Переподключение при ошибке пула
 */
async function reconnect() {
  try {
    if (pool && pool.connected) await pool.close();
  } catch (err) {
    await logger.warn("db_close_error", { message: err.message });
  }
  pool = null;
  await logger.info("db_reconnect", "♻️ Переподключение к MSSQL...");
  await connectToDb();
}

/**
 * Проверка живости соединения (heartbeat)
 */
async function checkDbHealth() {
  try {
    const conn = await connectToDb();
    const start = Date.now();
    await conn.request().query("SELECT 1 AS alive");
    const ms = Date.now() - start;
    await logger.info("db_heartbeat", `✅ MSSQL жив (${ms} ms)`);
  } catch (err) {
    lastDbDownAt = Date.now();
    await logger.dbDown(err.message);
    await reconnect();
  }
}

/**
 * Проверка производительности запросов
 */
export async function safeQuery(query, params = []) {
  const conn = await connectToDb();
  const request = conn.request();

  params.forEach((p) => request.input(p.name, p.type, p.value));

  const start = Date.now();
  try {
    const result = await request.query(query);
    const ms = Date.now() - start;

    if (ms > 1000) {
      await logger.slowQuery({ query, duration: ms });
    }

    return result;
  } catch (err) {
    await logger.error("query_error", { query, message: err.message });
    throw err;
  }
}

/**
 * Автоматический heartbeat каждые 5 минут
 */
setInterval(checkDbHealth, 5 * 60 * 1000).unref();

/**
 * Корректное завершение при SIGINT/SIGTERM
 */
async function shutdown() {
  await logger.info("db_shutdown", "🛑 MSSQL соединение закрывается...");
  if (pool && pool.connected) await pool.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Первичное подключение
connectToDb();

export const poolPromise = connectToDb();
export { sql };
export default { sql, connectToDb, poolPromise, safeQuery };
