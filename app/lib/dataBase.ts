import mysql, { Pool, PoolOptions } from "mysql2/promise";

type GlobalWithMySqlPool = typeof globalThis & {
  __benviMySqlPool?: Pool;
};

type RequiredDbEnv = "DB_HOST" | "DB_PORT" | "DB_USER" | "DB_PASSWORD" | "DB_NAME";

export class DatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigurationError";
  }
}

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
    throw new DatabaseConfigurationError(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }

  return value;
}

function requireDbHost(): string {
  const host = requireEnv("DB_HOST").trim();

  if (host.includes("://") || host.includes("@") || host.includes("/") || host.includes("?") || host.includes(":")) {
    throw new DatabaseConfigurationError("DB_HOST deve conter apenas o host do MySQL, sem protocolo, usuario, senha, porta, caminho ou query string.");
  }

  return host;
}

function buildSslConfig(): PoolOptions["ssl"] {
  if (!boolEnv(process.env.DB_SSL)) return undefined;

  return {
    rejectUnauthorized: true,
  };
}

function createPool(): Pool {
  return mysql.createPool({
    host: requireDbHost(),
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

export function hasRequiredDatabaseEnv(): boolean {
  return ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"].every((name) => {
    const value = process.env[name];
    return typeof value === "string" && value.trim().length > 0;
  });
}

let poolErrorHandlerAttached = false;

function attachPoolErrorHandler(pool: Pool) {
  if (poolErrorHandlerAttached) return;
  poolErrorHandlerAttached = true;

  (pool as any).on?.("error", () => {
    console.error("Erro no pool MySQL.");
  });
}

function getPool(): Pool {
  const existingPool = globalForPool.__benviMySqlPool;
  if (existingPool) return existingPool;

  const newPool = createPool();
  attachPoolErrorHandler(newPool);

  if (process.env.NODE_ENV !== "production") {
    globalForPool.__benviMySqlPool = newPool;
  }

  return newPool;
}

const pool = new Proxy(
  {},
  {
    get(_target, property, receiver) {
      const currentPool = getPool();
      const value = Reflect.get(currentPool, property, receiver);
      return typeof value === "function" ? value.bind(currentPool) : value;
    },
  }
) as Pool;

export default pool;
