import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import process from "process";
import configFile from "../config/config.ts";
import User from "./user.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env =
  (process.env.NODE_ENV as "development" | "production") || "development";

type ConfigType = {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: import("sequelize").Dialect;
  logging: boolean;
  timezone: string;
  dialectOptions?: object;
  use_env_variable?: string;
};

type DB = {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  User: ReturnType<typeof User>;
};

const config: ConfigType = {
  ...configFile[env],
  dialect: configFile[env].dialect as import("sequelize").Dialect,
};

const db: {
  [key: string]: any; //TODO: replace
  sequelize?: Sequelize;
  Sequelize?: typeof Sequelize;
} = {};

let sequelize: Sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(
    process.env[config.use_env_variable] as string,
    config
  );
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Load models async
async function loadModels() {
  const files = fs.readdirSync(__dirname).filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== path.basename(__filename) &&
      (file.endsWith(".js") || file.endsWith(".ts")) &&
      !file.endsWith(".test.ts") &&
      !file.endsWith(".test.js")
    );
  });

  for (const file of files) {
    const modulePath = pathToFileURL(path.join(__dirname, file)).href;
    const modelModule = await import(modulePath);
    const model = modelModule.default(sequelize, DataTypes);
    db[model.name] = model;
  }

  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
}

await loadModels();

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
