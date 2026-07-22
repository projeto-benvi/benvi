import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;

  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();

    if (!key || process.env[key] !== undefined) continue;

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}

function loadLocalEnv() {
  loadEnvFile(resolve(process.cwd(), ".env.local"));
  loadEnvFile(resolve(process.cwd(), ".env"));
}

async function main() {
  loadLocalEnv();

  const [{ default: pool }, { runMigrations }] = await Promise.all([
    import("@/app/lib/dataBase"),
    import("@/app/migrations"),
  ]);

  try {
    await runMigrations();
    console.log("Migrations executadas com sucesso.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("ERRO REAL:");
  console.error(err);
  process.exit(1);
});
