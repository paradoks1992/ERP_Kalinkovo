// routes/employees.js
import { Router } from 'express';
import {
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee
} from '../controllers/employees.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = Router();

// Получить всех сотрудников
router.get('/', verifyToken, getAllEmployees);

// Добавить нового сотрудника (только админ)
router.post('/', verifyToken, isAdmin, addEmployee);

// Обновить сотрудника (только админ)
router.put('/:id', verifyToken, isAdmin, updateEmployee);

// Удалить сотрудника (только админ)
router.delete('/:id', verifyToken, isAdmin, deleteEmployee);

export default router;
