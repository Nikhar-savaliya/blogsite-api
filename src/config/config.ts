import { config as envConfig } from "dotenv";

envConfig();

interface Config {
  port: string;
  mongodbURL: string;
  env: string;
  jwtSecret: string;
}

const _config: Config = {
  port: process.env.PORT || "3000",
  mongodbURL:
    process.env.MONGO_CONNECTION_STRING ||
    "mongodb://localhost:27017/mydatabase",
  env: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "default_secret",
};

export const config: Readonly<Config> = Object.freeze(_config);
