// instrumentation.ts
export async function register() {
  // Roda apenas no servidor, nunca no client bundle
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { runMigrations } = await import('./app/migrations');
    await runMigrations();
  }
}