// instrumentation.ts
export async function register() {
  // Migrations devem ser executadas manualmente via `npm run migrate`.
  // Nao execute alteracoes de schema no boot da aplicacao em ambiente serverless.
}
