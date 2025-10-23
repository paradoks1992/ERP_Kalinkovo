// index.js
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import os from "os";

import logger from "./logger.js";
import { connectToDb } from "./db.js";

import { verifyToken } from "./middleware/verifyToken.js";
import { isAdmin } from "./middleware/isAdmin.js";

// routes
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import productsRoutes from "./routes/products.routes.js";
import productTypesRoutes from "./routes/productTypes.routes.js";
import storagesRoutes from "./routes/storages.routes.js";
import storageStatsRoutes from "./routes/storageStats.routes.js";
import monitorRoutes from "./routes/monitor.routes.js";
import permissionsRoutes from "./routes/permissions.routes.js";
import employeesRoutes from "./routes/employees.js";
import profileRoutes from "./routes/profile.js";
import logsRoutes from "./routes/logs.routes.js";
import usersRoutes from "./routes/users.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";

// SSE
import eventsRoutes from "./routes/events.routes.js";

const app = express();

/* Base middlewares */
app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false, // не мешаем React/Vite
  })
);

// Разрешённые фронты (можно задать CORS_ORIGIN через .env, CSV)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [
      "http://localhost:5173", // admin
      "http://localhost:5174", // forklift
      "http://localhost:5175", // manager
      "http://localhost:5176", // monitor
    ];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS: Доступ запрещён"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options(/.*/, cors());

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

/* Health */
app.get("/health", async (_req, res) => {
  try {
    const pool = await connectToDb();
    const t0 = Date.now();
    await pool.request().query("SELECT 1 AS alive");
    res.status(200).json({
      status: "ok",
      latency_ms: Date.now() - t0,
      version: process.env.APP_VERSION || "1.0.0",
    });
  } catch (e) {
    res.status(500).json({ status: "db_error", error: e?.message });
  }
});

/* System status (admin only) */
app.get("/api/system/status", verifyToken, isAdmin, async (_req, res) => {
  try {
    const uptimeSec = process.uptime();
    const uptime = {
      seconds: Math.floor(uptimeSec),
      pretty: `${Math.floor(uptimeSec / 3600)}h ${Math.floor(
        (uptimeSec % 3600) / 60
      )}m`,
    };

    const mem = process.memoryUsage();
    const totalMem = os.totalmem();
    const usedRss = mem.rss;
    const memUsagePct = Math.round((usedRss / totalMem) * 100);

    const load = os.loadavg?.() || [0, 0, 0];
    const cpus = os.cpus?.() || [];
    const cpuLoadPct =
      load[0] && cpus.length
        ? Math.min(100, Math.round((load[0] / cpus.length) * 100))
        : null;

    let dbStatus = "disconnected";
    let dbLatencyMs = null;
    try {
      const t0 = Date.now();
      const pool = await connectToDb();
      await pool.request().query("SELECT 1");
      dbLatencyMs = Date.now() - t0;
      dbStatus = "connected";
    } catch {
      dbStatus = "disconnected";
    }

    res.json({
      app: process.env.APP_NAME || "ERP_Kalinkovo",
      version: process.env.APP_VERSION || "1.0.0",
      timestamp: new Date().toISOString(),
      uptime,
      system: {
        platform: os.platform(),
        release: os.release(),
        hostname: os.hostname(),
        cpu_count: cpus.length || null,
        cpu_load_pct: cpuLoadPct,
        memory: {
          total_gb: +(totalMem / 1024 / 1024 / 1024).toFixed(2),
          rss_gb: +(usedRss / 1024 / 1024 / 1024).toFixed(2),
          usage_pct: memUsagePct,
        },
      },
      database: {
        status: dbStatus,
        latency_ms: dbLatencyMs,
        server: process.env.DB_SERVER,
        database: process.env.DB_NAME,
      },
    });
  } catch (err) {
    logger.error("[/api/system/status] unhandled", err);
    res.status(500).json({ message: "Internal error" });
  }
});

/* Routes */
// Публичные
app.use("/api/auth", authRoutes);
app.use("/api/monitor", monitorRoutes);
// SSE
app.use("/api/events", eventsRoutes);

// После авторизации
app.use("/api/storages", verifyToken, storagesRoutes);
app.use("/api/product-types", verifyToken, productTypesRoutes);
app.use("/api/storage-stats", verifyToken, storageStatsRoutes);
app.use("/api/profile", verifyToken, profileRoutes);
app.use("/api/tasks", verifyToken, tasksRoutes);

// Только админ
app.use("/api/admin", verifyToken, isAdmin, adminRoutes);
app.use("/api/permissions", verifyToken, isAdmin, permissionsRoutes);
app.use("/api/users", verifyToken, isAdmin, usersRoutes);
app.use("/api/employees", verifyToken, isAdmin, employeesRoutes);
app.use("/api/logs", verifyToken, isAdmin, logsRoutes);
app.use("/api/products", verifyToken, isAdmin, productsRoutes);

/* 404 */
app.use((_req, res) => {
  res.status(404).json({ message: "Not Found" });
});

/* Global error */
app.use((err, _req, res, _next) => {
  logger.error("[GLOBAL ERROR]", { message: err.message, stack: err.stack });
  res.status(500).json({ message: "Internal server error" });
});

/* Startup */
const PORT = Number(process.env.PORT || 3000);
const server = app.listen(PORT, async () => {
  await logger.info(`✅ API listening on http://localhost:${PORT}`);
});

const gracefulShutdown = async () => {
  await logger.info("🛑 Server shutting down...");
  server.close(() => process.exit(0));
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
