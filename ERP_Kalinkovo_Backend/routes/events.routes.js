// routes/events.routes.js
import express from "express";
import logger from "../logger.js";

const router = express.Router();

/**
 * SSE (Server-Sent Events)
 * URL: /api/events
 * Реалтайм-канал для фронтов (manager, monitor и др.)
 */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
];

router.get("/", async (req, res) => {
  try {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "null");
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const clientIp = req.ip || req.socket.remoteAddress;
    const connectTime = new Date().toISOString();

    await logger.info("SSE connected", { ip: clientIp, at: connectTime });

    res.write(
      `data: ${JSON.stringify({
        type: "connected",
        message: "SSE connection established",
        ip: clientIp,
        ts: connectTime,
      })}\n\n`
    );

    const sendPing = () => {
      res.write(
        `data: ${JSON.stringify({
          type: "ping",
          ts: new Date().toISOString(),
        })}\n\n`
      );
    };
    const pingTimer = setInterval(sendPing, 10_000);

    req.on("close", async () => {
      clearInterval(pingTimer);
      await logger.info("SSE disconnected", { ip: clientIp });
    });
  } catch (err) {
    await logger.error("SSE error", { message: err.message, stack: err.stack });
    res.status(500).end();
  }
});

export default router;
