import { container } from "tsyringe";
import { AuthService } from "./services/auth.service.js";
import { AuthController } from "./controllers/auth.controller.js";
import { UserService } from "./services/user.service.js";
import { UserController } from "./controllers/user.controller.js";
import { UserRepository } from "./repositories/userRepository.js";

container.register("AuthService", { useClass: AuthService });
container.register("AuthController", { useClass: AuthController });

container.register("UserService", { useClass: UserService });
container.register("UserController", { useClass: UserController });
container.register("UserRepository", { useClass: UserRepository });
