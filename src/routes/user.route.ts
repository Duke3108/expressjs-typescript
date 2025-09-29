import { Router } from "express";
import { container } from "tsyringe";
import { UserController } from "../controllers/user.controller.ts";
import { isAdmin, verifyToken } from "../middlewares/verify-token.ts";

class UserRoutes {
  public router: Router;
  private userController: UserController;

  constructor() {
    this.router = Router();
    this.userController = container.resolve(UserController);
    //this.initializeRoutes();
    this.testRoutes();
  }

  private testRoutes() {
    this.router.get(
      "/test/:uid",
      this.userController.getUserByIdTest.bind(this.userController)
    );
    this.router.get(
      "/test/email/:email",
      this.userController.getUserByEmailTest.bind(this.userController)
    );
    this.router.get(
      "/test",
      this.userController.getAllUsersTest.bind(this.userController)
    );
    this.router.post(
      "/test",
      this.userController.createUserTest.bind(this.userController)
    );
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
