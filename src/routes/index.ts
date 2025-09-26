import type { Application } from "express";
import { errorHandler, notFound } from "../middlewares/error-handler.ts";
import auth from "./auth.route.ts";
import user from "./user.route.ts";

const initRoutes = (app: Application) => {
  app.use("/api/v1/auth", auth);
  app.use("/api/v1/users", user);

  app.use(notFound);
  app.use(errorHandler);
};

export default initRoutes;
