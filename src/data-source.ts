import "reflect-metadata";
import { DataSource } from "typeorm";
import "dotenv/config";
import { User } from "./entity/User.ts";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "",
  port: parseInt(process.env.DB_PORT ?? ""),
  username: process.env.DB_USER ?? "",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "",
  synchronize: true,
  logging: false,
  entities: [User],
});

export const initializeDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
