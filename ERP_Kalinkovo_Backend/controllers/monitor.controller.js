// controllers/monitor.controller.js
import logger, { SLOW_QUERY_THRESHOLD_MS } from "../logger.js";
import * as monitorService from "../services/monitor.service.js";

/**
 * GET /api/monitor/:storageId
 */
export async function getByStorage(req, res) {
  const storageId = parseInt(req.params.storageId || req.params.id || "", 10);
  const ip = req.ip;
  const started = Date.now();

  if (!storageId || Number.isNaN(storageId)) {
    res.status(400).json({ message: "storageId обязателен" });
    return;
  }

  try {
    const data = await monitorService.getByStorage(storageId);
    const ms = Date.now() - started;

    if (ms > SLOW_QUERY_THRESHOLD_MS) {
      await logger.slowQuery({
        controller: "monitor.getByStorage",
        storageId,
        duration: ms,
        query: "monitorService.getByStorage(storageId)",
      });
    }

    await logger.info("monitor_request", { storageId, ip, ms, ok: true });
    res.json(data);
  } catch (err) {
    const ms = Date.now() - started;
    await logger.controllerCrash("monitor.getByStorage", err);
    await logger.error(
      "monitor_request_fail",
      { storageId, ip, ms, message: err.message },
      { critical: true }
    );
    res.status(500).json({ message: "Ошибка загрузки данных монитора" });
  }
}

export default { getByStorage };
