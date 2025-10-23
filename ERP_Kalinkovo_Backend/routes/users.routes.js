// routes/users.routes.js
import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";
// Если захочешь — можно заменить на authorizePermission("users:manage")
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
} from "../controllers/users.controller.js";

const router = Router();

router.use(verifyToken, isAdmin); // доступ только для админов

router.get("/", listUsers);
router.get("/:id", getUser);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/:id/reset-password", resetPassword);

export default router;
