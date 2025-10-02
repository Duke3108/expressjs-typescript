import type { Application } from "express";
import authRoutes from "./auth.route.js";
import { errorHandler, notFound } from "../middlewares/error-handler.js";
import userRoutes from "./user.route.js";

class RouteInitializer {
  constructor(private app: Application) {}

  public initRoutes() {
    this.app.use("/api/v1/auth", authRoutes);
    this.app.use("/api/v1/users", userRoutes);

    this.app.use(notFound);
    this.app.use(errorHandler);
  }
}

export default RouteInitializer;
