import { Router } from "express";
import { container } from "tsyringe";
import { UserController } from "../controllers/user.controller.js";
import { isAdmin, verifyToken } from "../middlewares/verify-token.js";

class UserRoutes {
  public router: Router;
  private userController: UserController;

  constructor() {
    this.router = Router();
    this.userController = container.resolve(UserController);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/",
      [verifyToken, isAdmin],
      this.userController.createUser.bind(this.userController)
    );

    this.router.get(
      "/",
      [verifyToken, isAdmin],
      this.userController.getAllUsers.bind(this.userController)
    );

    this.router.get(
      "/:uid",
      verifyToken,
      this.userController.getUserById.bind(this.userController)
    );

    this.router.patch(
      "/:uid",
      verifyToken,
      this.userController.updateUser.bind(this.userController)
    );

    this.router.delete(
      "/:uid",
      [verifyToken, isAdmin],
      this.userController.deleteUser.bind(this.userController)
    );
  }
}

const userRoutes = new UserRoutes().router;

export default userRoutes;
