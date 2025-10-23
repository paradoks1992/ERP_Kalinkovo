// routes/batches.routes.js
import { Router } from 'express';
import {
  getBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  inboundBatch,
  outboundBatch
} from '../controllers/batches.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = Router();

/* ──────────────────────────────────────────────── */
/* 📦 Основные маршруты (для админки) */
/* ──────────────────────────────────────────────── */

// Получить все партии
router.get('/', verifyToken, isAdmin, getBatches);

// Создать новую партию (только админ)
router.post('/', verifyToken, isAdmin, createBatch);

// Обновить партию (только админ)
router.put('/:id', verifyToken, isAdmin, updateBatch);

// Удалить партию (только админ)
router.delete('/:id', verifyToken, isAdmin, deleteBatch);

/* ──────────────────────────────────────────────── */
/* 🚜 Операции для карщика */
/* ──────────────────────────────────────────────── */

// Ввоз (добавление партии на склад)
router.post('/inbound', verifyToken, inboundBatch);

// Вывоз (списание партии со склада)
router.post('/outbound', verifyToken, outboundBatch);

export default router;
