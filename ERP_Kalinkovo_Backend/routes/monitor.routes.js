// routes/monitor.routes.js
import express from "express";
import { getByStorage } from "../controllers/monitor.controller.js";

const router = express.Router();

/**
 * Публичный доступ к монитору (для реальных панелей).
 * Если решим закрыть — вернём verifyToken + authorizePermission("monitor:read").
 */
router.get("/:storageId", getByStorage);

export default router;
