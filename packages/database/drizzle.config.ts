import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // Dialeto moderno
  dbCredentials: {
    url: "postgresql://postgres.ldmyywjrqyqoafwxspin:Mollinetti2025!@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
  },
  verbose: true,
  strict: true,
});
