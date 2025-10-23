// routes/storages.routes.js
import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { authorizePermission } from "../middleware/authorizePermission.js";
import {
  getStorages,
  getStorageById,
  createStorage,
  updateStorage,
  deleteStorage,
  getSimpleStoragesList
} from "../controllers/storages.controller.js";

const router = Router();

/* ──────────────────────────────────────────────── */
/* 📦 Открытые маршруты (для карщика, менеджера и т.д.) */
/* ──────────────────────────────────────────────── */

// Возвращает краткий список складов (id, name)
// доступен всем авторизованным пользователям
router.get("/", verifyToken, getSimpleStoragesList);

/* ──────────────────────────────────────────────── */
/* 🧰 Админ-функции (с правами) */
/* ──────────────────────────────────────────────── */

router.get("/full", verifyToken, authorizePermission("view_storages"), getStorages);
router.get("/:id", verifyToken, authorizePermission("view_storages"), getStorageById);
router.post("/", verifyToken, authorizePermission("edit_storages"), createStorage);
router.put("/:id", verifyToken, authorizePermission("edit_storages"), updateStorage);
router.delete("/:id", verifyToken, authorizePermission("edit_storages"), deleteStorage);

export default router;
