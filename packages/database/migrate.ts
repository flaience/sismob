import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const runMigration = async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(sql);

  console.log("⏳ Aplicando migrations no Supabase...");

  await migrate(db, { migrationsFolder: "drizzle" });

  console.log("✅ Migrations aplicadas com sucesso!");
  process.exit(0);
};

runMigration().catch((err) => {
  console.error("❌ Falha na migração:", err);
  process.exit(1);
});
