import { Router } from "express";
import { container } from "tsyringe";
import { AuthController } from "../controllers/auth.controller.js";

class AuthRoutes {
  public router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = container.resolve(AuthController);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/register",
      this.authController.register.bind(this.authController)
    );
    this.router.post(
      "/login",
      this.authController.login.bind(this.authController)
    );
    this.router.post(
      "/forgot-password",
      this.authController.forgotPassword.bind(this.authController)
    );
    this.router.post(
      "/reset-password",
      this.authController.resetPassword.bind(this.authController)
    );
    this.router.post(
      "/refresh-token",
      this.authController.refreshToken.bind(this.authController)
    );
    this.router.post(
      "/verify-email/:token",
      this.authController.verifyEmail.bind(this.authController)
    );
    //bind để giữ this
  }
}
const authRoutes = new AuthRoutes().router;

export default authRoutes;
