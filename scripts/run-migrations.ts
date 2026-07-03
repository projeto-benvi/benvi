import pool from "@/app/lib/dataBase";
import { runMigrations } from "@/app/migrations";

async function main() {
  try {
    await runMigrations();
    console.log("Migrations executadas com sucesso.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Erro ao executar migrations:", error);
  process.exit(1);
});
