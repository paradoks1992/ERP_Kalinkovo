// routes/profile.js
import { Router } from 'express';
import { getProfile } from '../controllers/profile.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();

// Получение профиля текущего пользователя
router.get('/', verifyToken, getProfile);

export default router;
