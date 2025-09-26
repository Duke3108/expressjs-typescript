import { Router } from "express";
import { container } from "tsyringe";
import { AuthController } from "../controllers/auth.controller.ts";

const router = Router();
const authController = container.resolve(AuthController);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/refresh-token", authController.refreshToken);
router.post("/verify-email/:token", authController.verifyEmail);

export default router;
