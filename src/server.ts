import "reflect-metadata";
import express from "express";
import "./container.ts";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import RouteInitializer from "./routes/index.ts";
import { initializeDB } from "./data-source.ts";

const app = express();
const PORT = process.env.PORT || 8888;

app.use(
  cors({
    origin: "*", //TODO: them domain FE
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initializeDB();

const routes = new RouteInitializer(app);
routes.initRoutes();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
