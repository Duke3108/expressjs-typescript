import dotenv from "dotenv";
import { Sequelize, type Dialect } from "sequelize";
dotenv.config();

const dbName = process.env.DB_NAME ?? "";
const dbUser = process.env.DB_USER ?? "";
const dbPassword = process.env.DB_PASSWORD ?? "";
const dbHost = process.env.DB_HOST ?? "";
const dbDialect = process.env.DB_DIALECT as Dialect;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: dbDialect,
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default connectDB;
