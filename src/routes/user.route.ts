import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { verifyToken, isAdmin } from "../middlewares/verify-token.js";
import { Router } from "express";
const router = Router();

router.post("/", [verifyToken, isAdmin], createUser);
router.get("/", [verifyToken, isAdmin], getAllUsers);
router.get("/:uid", verifyToken, getUserById);
router.patch("/:uid", verifyToken, updateUser);
router.delete("/:uid", [verifyToken, isAdmin], deleteUser);

export default router;
