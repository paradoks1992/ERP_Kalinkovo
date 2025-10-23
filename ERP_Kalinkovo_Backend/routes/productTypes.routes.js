// routes/productTypes.routes.js
import { Router } from "express";
import {
  getProductTypes,
  getSimpleProductTypes,
  createProductType,
  updateProductType,
  deleteProductType
} from "../controllers/productTypes.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = Router();

/* ──────────────────────────────────────────────── */
/* 🍏 Публичный список видов продукции (карщик / менеджер) */
/* ──────────────────────────────────────────────── */

// Возвращает [{ id, name, sortable }]
router.get("/", verifyToken, getSimpleProductTypes);

/* ──────────────────────────────────────────────── */
/* 🧰 Админские функции */
/* ──────────────────────────────────────────────── */

router.get("/full", verifyToken, isAdmin, getProductTypes);
router.post("/", verifyToken, isAdmin, createProductType);
router.put("/:id", verifyToken, isAdmin, updateProductType);
router.delete("/:id", verifyToken, isAdmin, deleteProductType);

export default router;
