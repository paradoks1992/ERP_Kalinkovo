// routes/tasks.routes.js
import express from "express";
import {
  createTask,            // менеджер создаёт задачу
  acceptTaskByForeman,   // бригадир принимает задачу
  assignTaskToForklift,  // бригадир назначает карщика и маршрут
  acceptTaskByForklift,  // карщик принимает задачу
  pushTaskProgress,      // карщик фиксирует прогресс (частично)
  completeTask,          // завершение задачи
  cancelTask,            // отмена задачи
  listTasks,             // список задач (по ролям и фильтрам)
  getTaskDetails         // детали конкретной задачи + прогресс
} from "../controllers/tasks.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

/* ──────────────────────────────────────────────── */
/* 🚀 Основные маршруты для задач */
/* ──────────────────────────────────────────────── */

// Создать задачу (менеджер)
router.post("/", verifyToken, createTask);

// Принять задачу бригадиром
router.put("/:id/accept-foreman", verifyToken, acceptTaskByForeman);

// Назначить карщика и маршрут (бригадир)
router.put("/:id/assign", verifyToken, assignTaskToForklift);

// Принять задачу карщиком
router.put("/:id/accept-forklift", verifyToken, acceptTaskByForklift);

// Отправить прогресс выполнения (карщик, дробно)
router.post("/:id/progress", verifyToken, pushTaskProgress);

// Завершить задачу (вручную)
router.put("/:id/complete", verifyToken, completeTask);

// Отменить задачу
router.put("/:id/cancel", verifyToken, cancelTask);

// Получить список задач (по ролям/фильтрам)
router.get("/", verifyToken, listTasks);

// Получить детали задачи + историю прогресса
router.get("/:id", verifyToken, getTaskDetails);

export default router;
