// routes/admin.js
import { Router } from 'express';
import { getAdminPanelData } from '../controllers/admin.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = Router();

// Данные для панели администратора
router.get('/panel', verifyToken, isAdmin, getAdminPanelData);

export default router;
