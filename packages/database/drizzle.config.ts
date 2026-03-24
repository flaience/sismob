import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Carrega o .env da raiz do monorepo ou da pasta atual
dotenv.config({ path: "../../.env" });

export default defineConfig({
  schema: "./schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // Mudou de 'driver' para 'dialect'
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Mudou de 'connectionString' para 'url'
  },
  verbose: true,
  strict: true,
});
