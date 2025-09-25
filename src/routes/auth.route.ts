import { Router } from "express";
import {
  forgotPassword,
  login,
  refreshToken,
  register,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller.js";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token/:token", refreshToken);
router.post("/verify-email/:token", verifyEmail);

export default router;
