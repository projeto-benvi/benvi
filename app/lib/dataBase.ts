import mysql, { Pool, PoolOptions } from "mysql2/promise";

type GlobalWithMySqlPool = typeof globalThis & {
  __benviMySqlPool?: Pool;
};

type RequiredDbEnv = "DB_HOST" | "DB_PORT" | "DB_USER" | "DB_PASSWORD" | "DB_NAME";

function boolEnv(value: string | undefined): boolean {
  return ["1", "true", "yes", "on"].includes(String(value ?? "").toLowerCase());
}

function numberEnv(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function requireEnv(name: RequiredDbEnv): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }

  return value;
}

function buildSslConfig(): PoolOptions["ssl"] {
  if (!boolEnv(process.env.DB_SSL)) return undefined;

  return {
    rejectUnauthorized: true,
  };
}

function createPool(): Pool {
  return mysql.createPool({
    host: requireEnv("DB_HOST"),
    user: requireEnv("DB_USER"),
    password: requireEnv("DB_PASSWORD"),
    database: requireEnv("DB_NAME"),
    port: numberEnv(requireEnv("DB_PORT"), 3306),
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ssl: buildSslConfig(),
  });
}

const globalForPool = globalThis as GlobalWithMySqlPool;

const pool = globalForPool.__benviMySqlPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForPool.__benviMySqlPool = pool;
}

(pool as any).on?.("error", () => {
  console.error("Erro no pool MySQL.");
});

export default pool;
