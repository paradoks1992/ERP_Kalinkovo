// logger.js — централизованный логгер + Telegram уведомления + health-чеки (улучшенный)
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const APP_NAME = process.env.APP_NAME || "ERP_Kalinkovo";
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), "logs");
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TG_CHAT = process.env.TELEGRAM_CHAT_ID || "";

const WARNING_COOLDOWN_MS = 10 * 60 * 1000; // 10 мин
const SLOW_QUERY_THRESHOLD_MS = parseInt(process.env.SLOW_QUERY_MS || "1000", 10);
const CPU_ALERT_THRESHOLD = parseInt(process.env.CPU_ALERT_PCT || "90", 10);
const MEM_ALERT_BYTES = parseInt(
  process.env.MEM_ALERT_BYTES || (1.2 * 1024 * 1024 * 1024).toString(),
  10
);

const _lastSentMap = new Map();
const _tgQueue = [];
let _tgActive = false;

// --- helpers ---
async function ensureDir(dir) {
  try {
    await fsp.mkdir(dir, { recursive: true });
  } catch {}
}

function fileFor(level) {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(LOG_DIR, `${level}-${date}.log`);
}

async function write(level, tag, payload) {
  await ensureDir(LOG_DIR);
  const line = {
    ts: new Date().toISOString(),
    app: APP_NAME,
    level,
    tag,
    host: os.hostname(),
    payload,
  };
  await fsp.appendFile(fileFor(level), JSON.stringify(line) + os.EOL);
}

function needTelegram() {
  return Boolean(TG_TOKEN && TG_CHAT);
}

// --- Telegram queue (антиспам + надёжная доставка) ---
function enqueueTelegram(text) {
  if (!needTelegram()) return;
  _tgQueue.push(text);
  processQueue();
}

async function processQueue() {
  if (_tgActive || !_tgQueue.length) return;
  _tgActive = true;
  while (_tgQueue.length) {
    const msg = _tgQueue.shift();
    try {
      await axios.post(
        `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,
        {
          chat_id: TG_CHAT,
          text: msg,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        },
        { timeout: 8000 }
      );
      await new Promise((r) => setTimeout(r, 500)); // 2 msg/сек
    } catch (err) {
      console.error("[telegram] send fail:", err.message);
      // вернуть сообщение в очередь при временной ошибке
      if (/timeout|ECONNRESET|ENET|ETIMEDOUT/.test(err.message))
        _tgQueue.unshift(msg);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  _tgActive = false;
}

function shouldSend(key, cooldownMs) {
  const now = Date.now();
  const last = _lastSentMap.get(key) || 0;
  if (now - last >= cooldownMs) {
    _lastSentMap.set(key, now);
    return true;
  }
  return false;
}

// --- основной логгер ---
const logger = {
  async info(tag, payload) {
    await write("info", tag, payload);
  },
  async warn(tag, payload, { notify = false, dedupeKey = tag, cooldownMs = WARNING_COOLDOWN_MS } = {}) {
    await write("warn", tag, payload);
    if (notify && shouldSend(`warn:${dedupeKey}`, cooldownMs)) {
      enqueueTelegram(`🟧 *WARN* ${APP_NAME}\n*${tag}*\n\`${JSON.stringify(payload)}\``);
    }
  },
  async error(tag, payload, { critical = false } = {}) {
    await write("error", tag, payload);
    if (critical) {
      enqueueTelegram(`🟥 *CRITICAL* ${APP_NAME}\n*${tag}*\n\`${JSON.stringify(payload)}\``);
    }
  },
  async http(req, res, ms) {
    await write("http", "request", {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip,
      status: res.statusCode,
      ms,
      ua: req.headers["user-agent"],
    });
  },
  async startup(msg = "Сервер запущен") {
    await write("info", "server_start", { msg });
    enqueueTelegram(`🚀 *${APP_NAME}* — ${msg}`);
  },
  async shutdown(msg = "Сервер остановлен") {
    await write("info", "server_stop", { msg });
    enqueueTelegram(`🛑 *${APP_NAME}* — ${msg}`);
  },

  // дополнительные уведомления
  async dbDown(reason) {
    await write("error", "db_down", { reason });
    enqueueTelegram(`❌ *${APP_NAME}* — SQL недоступен\nПричина: \`${reason}\``);
  },
  async dbRecovery(ms) {
    await write("info", "db_recovery", { ms });
    enqueueTelegram(`✅ *${APP_NAME}* — MSSQL восстановлен за *${ms} ms*`);
  },
  async slowQuery(info) {
    await write("warn", "slow_query", info);
    if (shouldSend("slow_query", WARNING_COOLDOWN_MS)) {
      enqueueTelegram(`⚠️ *Slow Query* ${APP_NAME}\n\`${info.query?.slice(0, 200) || "query"}\`\n⏱ ${info.duration} ms`);
    }
  },
  async controllerCrash(name, err) {
    await write("error", "controller_crash", { name, message: err.message, stack: err.stack });
    enqueueTelegram(`💥 *Crash* ${APP_NAME}\nКонтроллер: *${name}*\n\`${err.message}\``);
  },

  // короткие алиасы для UI и сервисов
  notifyInfo(text) {
    enqueueTelegram(`ℹ️ *${APP_NAME}*\n${text}`);
  },
  notifyWarning(text) {
    enqueueTelegram(`⚠️ *${APP_NAME}*\n${text}`);
  },
  notifyCritical(text) {
    enqueueTelegram(`🚨 *${APP_NAME}*\n${text}`);
  },
};

// --- Health-watchers ---
function cpuPercent() {
  const loads = os.loadavg?.() || [0];
  const cores = os.cpus()?.length || 1;
  return Math.min(100, Math.round((loads[0] / cores) * 100));
}

async function checkMemory() {
  const rss = process.memoryUsage().rss;
  if (rss >= MEM_ALERT_BYTES)
    await logger.warn("memory_high", { rss }, { notify: true, dedupeKey: "memory_high" });
}

async function checkCPU() {
  const pct = cpuPercent();
  if (pct >= CPU_ALERT_THRESHOLD)
    await logger.warn("cpu_high", { pct }, { notify: true, dedupeKey: "cpu_high" });
}

async function checkDisk() {
  try {
    const { exec } = await import("node:child_process");
    const cmd =
      process.platform === "win32"
        ? `wmic logicaldisk get FreeSpace,Size /format:value`
        : `df -k / | tail -1 | awk '{print 100-$5}'`;
    const freePct = await new Promise((resolve) => {
      exec(cmd, { timeout: 5000 }, (err, stdout) => {
        if (err || !stdout) return resolve(null);
        const v = parseFloat(stdout.toString().match(/(\d+(?:\.\d+)?)/)?.[0]);
        resolve(Number.isFinite(v) ? v : null);
      });
    });
    if (freePct !== null && freePct < 5)
      await logger.warn("disk_low", { freePct }, { notify: true, dedupeKey: "disk_low" });
  } catch {}
}

export function startHealthWatchers() {
  setInterval(checkCPU, 5 * 60 * 1000).unref();
  setInterval(checkMemory, 5 * 60 * 1000).unref();
  setInterval(checkDisk, 5 * 60 * 1000).unref();
}

export { logger as default, enqueueTelegram as sendTelegramRaw, SLOW_QUERY_THRESHOLD_MS };
