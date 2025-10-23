// routes/storageStats.routes.js
import express from "express";
import {
  getStorageStats,
  updateStorageStat,
  syncAllStorageStats,
} from "../controllers/storageStats.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { authorizePermission } from "../middleware/authorizePermission.js";

const router = express.Router();

// просмотр статистики
router.get(
  "/",
  verifyToken,
  authorizePermission("storage-stats:read"),
  getStorageStats
);

// обновление одной записи
router.post(
  "/",
  verifyToken,
  authorizePermission("storage-stats:edit"),
  updateStorageStat
);

// массовая синхронизация
router.post(
  "/sync",
  verifyToken,
  authorizePermission("storage-stats:edit"),
  syncAllStorageStats
);

export default router;
