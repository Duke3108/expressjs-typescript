import "reflect-metadata";
import { DataSource } from "typeorm";
import { config as dotenvConfig } from "dotenv";
import { User } from "./entity/User.js";

dotenvConfig({ path: ".env" });

const AppDataSource = new DataSource({
  type: "postgres",
  host: `${process.env.DB_HOST}`,
  port: Number(process.env.DB_PORT),
  username: `${process.env.DB_USER}`,
  password: `${process.env.DB_PASSWORD}`,
  database: `${process.env.DB_NAME}`,
  entities: [User],
  migrations: ["dist/migrations/*.js"],
  synchronize: false,
  logging: false,
});
export default AppDataSource;
