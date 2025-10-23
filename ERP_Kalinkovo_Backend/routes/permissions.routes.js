import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { authorizePermission } from "../middleware/authorizePermission.js";
import {
  getAllPermissions,
  getUserPermissions,
  updateUserPermissions,
  getRoleMatrix,
  updateRoleMatrix,
  getAllKeys,
  syncRolePermissionsToUsers, // ✅ добавлено
} from "../controllers/permissions.controller.js";

const router = express.Router();

/**
 * 🔐 Управление разрешениями пользователей и ролей
 * Доступно только тем, у кого есть право manage_users
 */

/* ──────────────────────────────────────────────── */
/* 👥 Пользовательские разрешения */
/* ──────────────────────────────────────────────── */

// Получить все разрешения (таблица Permissions)
router.get(
  "/",
  verifyToken,
  authorizePermission("manage_users"),
  getAllPermissions
);

// Получить разрешения конкретного пользователя
router.get(
  "/user/:id",
  verifyToken,
  authorizePermission("manage_users"),
  getUserPermissions
);

// Обновить разрешения пользователя
router.post(
  "/user/:id",
  verifyToken,
  authorizePermission("manage_users"),
  updateUserPermissions
);

/* ──────────────────────────────────────────────── */
/* 🧩 Ролевая матрица прав (RolePermissions) */
/* ──────────────────────────────────────────────── */

// Получить полную матрицу прав по ролям
router.get(
  "/roles",
  verifyToken,
  authorizePermission("manage_users"),
  getRoleMatrix
);

// Обновить матрицу прав по ролям
router.put(
  "/roles",
  verifyToken,
  authorizePermission("manage_users"),
  updateRoleMatrix
);

// Получить список всех ключей разрешений
router.get(
  "/keys",
  verifyToken,
  authorizePermission("manage_users"),
  getAllKeys
);

/* ──────────────────────────────────────────────── */
/* 🔄 Синхронизация прав пользователей */
/* ──────────────────────────────────────────────── */

router.post(
  "/sync",
  verifyToken,
  authorizePermission("manage_users"),
  syncRolePermissionsToUsers
);

/* ──────────────────────────────────────────────── */

export default router;
