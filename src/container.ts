import { container } from "tsyringe";
import { AuthService } from "./services/auth.service.ts";
import { AuthController } from "./controllers/auth.controller.ts";
import { UserService } from "./services/user.service.ts";
import { UserController } from "./controllers/user.controller.ts";
import { UserRepository } from "./repositories/userRepository.ts";

container.register("AuthService", { useClass: AuthService });
container.register("AuthController", { useClass: AuthController });

container.register("UserService", { useClass: UserService });
container.register("UserController", { useClass: UserController });
container.register("UserRepository", { useClass: UserRepository });
