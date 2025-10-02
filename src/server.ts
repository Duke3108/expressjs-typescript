import "reflect-metadata";
import express from "express";
import "./container.js";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import RouteInitializer from "./routes/index.js";
import AppDataSource from "./data-source.js";

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

const initializeDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
initializeDB();

const routes = new RouteInitializer(app);
routes.initRoutes();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
