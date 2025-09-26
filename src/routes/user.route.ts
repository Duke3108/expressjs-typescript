import { verifyToken, isAdmin } from "../middlewares/verify-token.ts";
import { Router } from "express";
import { container } from "tsyringe";
import { UserController } from "../controllers/user.controller.ts";

const router = Router();
const userController = container.resolve(UserController);

router.post("/", [verifyToken, isAdmin], userController.createUser);
router.get("/", [verifyToken, isAdmin], userController.getAllUsers);
router.get("/:uid", verifyToken, userController.getUserById);
router.patch("/:uid", verifyToken, userController.updateUser);
router.delete("/:uid", [verifyToken, isAdmin], userController.deleteUser);

export default router;
