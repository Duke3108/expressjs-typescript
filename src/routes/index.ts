import { errorHandler, notFound } from "../middlewares/error-handler.js";
import auth from "./auth.route.js";
import user from "./user.route.js";

const initRoutes = (app: any) => {
  app.use("/api/v1/auth", auth);
  app.use("/api/v1/users", user);

  app.use(notFound);
  app.use(errorHandler);
};

export default initRoutes;
