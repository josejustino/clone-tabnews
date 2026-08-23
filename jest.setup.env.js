import { loadEnvConfig } from "@next/env";
import dotenv from "dotenv";
import path from "path";

loadEnvConfig(process.cwd());

dotenv.config({
  path: path.resolve(process.cwd(), ".env.development"),
  override: true,
});
