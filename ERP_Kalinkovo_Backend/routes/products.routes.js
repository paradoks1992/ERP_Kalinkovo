// routes/products.routes.js
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";
import {
  getProducts,
  getSimpleProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/products.controller.js";

const router = express.Router();

/* ──────────────────────────────────────────────── */
/* 🍎 Публичный список сортов (для всех авторизованных) */
/* ──────────────────────────────────────────────── */

// Возвращает [{ id, name }]
router.get("/simple", verifyToken, getSimpleProducts);

/* ──────────────────────────────────────────────── */
/* 🧰 CRUD для админки */
/* ──────────────────────────────────────────────── */

router.get("/", verifyToken, isAdmin, getProducts);
router.post("/", verifyToken, isAdmin, createProduct);
router.put("/:id", verifyToken, isAdmin, updateProduct);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

export default router;
