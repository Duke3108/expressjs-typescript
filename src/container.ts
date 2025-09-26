import { container } from "tsyringe";
import { AuthRepository } from "./middlewares/repositories/AuthRepository.ts";
import { AuthService } from "./services/auth.service.ts";
import { AuthController } from "./controllers/auth.controller.ts";
import { UserRepository } from "./middlewares/repositories/UserRepository.ts";
import { UserService } from "./services/user.service.ts";
import { UserController } from "./controllers/user.controller.ts";

container.register("AuthRepository", { useClass: AuthRepository });
container.register("AuthService", { useClass: AuthService });
container.register("AuthController", { useClass: AuthController });
container.register("UserRepository", { useClass: UserRepository });
container.register("UserService", { useClass: UserService });
container.register("UserController", { useClass: UserController });
