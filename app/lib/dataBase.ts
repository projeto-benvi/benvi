import mysql, { Pool, PoolOptions } from "mysql2/promise";

type GlobalWithMySqlPool = typeof globalThis & {
  __benviMySqlPool?: Pool;
};

function boolEnv(value: string | undefined): boolean {
  return ["1", "true", "yes", "on"].includes(String(value ?? "").toLowerCase());
}

function numberEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildSslConfig(): PoolOptions["ssl"] {
  if (!boolEnv(process.env.DB_SSL)) return undefined;

  const ca = process.env.DB_SSL_CA?.replace(/\\n/g, "\n");

  return {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
    ...(ca ? { ca } : {}),
  };
}

function createPool(): Pool {
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: numberEnv(process.env.DB_PORT, 3306),
    waitForConnections: true,
    connectionLimit: numberEnv(process.env.DB_CONNECTION_LIMIT, 5),
    queueLimit: numberEnv(process.env.DB_QUEUE_LIMIT, 0),
    connectTimeout: numberEnv(process.env.DB_CONNECT_TIMEOUT_MS, 10000),
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

(pool as any).on?.("error", (error: Error) => {
  console.error("Erro no pool MySQL:", error);
});

export default pool;
