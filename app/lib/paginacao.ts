/**
 * Utilitário central de paginação.
 *
 * Objetivo: padronizar como os endpoints de listagem recebem `limit`/`page`/`cursor`
 * e como respondem (dados + metadados), para que nenhuma listagem grande retorne
 * todos os registros de uma vez.
 *
 * Estratégia adotada: paginação por página/offset (mais simples e segura de aplicar
 * em cima das consultas existentes, várias delas com JOIN + GROUP BY + HAVING).
 * O contrato de resposta já expõe um `cursor` (opaco, calculado a partir da página)
 * para permitir evoluir para keyset/cursor real no futuro sem quebrar o formato
 * usado pelo front-end. Esse é o contrato proposto também para a mensageria
 * (ver PAGINACAO.md) — pendente de alinhamento com Pessoa 1 antes de aplicar
 * nas rotas de conversas/mensagens.
 */

export const LIMITE_PADRAO = 20;
export const LIMITE_MAXIMO = 100;

export interface ParametrosPaginacao {
  pagina: number;
  limite: number;
  offset: number;
}

export interface MetadadosPaginacao {
  paginaAtual: number;
  limite: number;
  totalRegistros: number;
  totalPaginas: number;
  temProximaPagina: boolean;
  temPaginaAnterior: boolean;
  proximoCursor: string | null;
}

export interface RespostaPaginada<T> {
  dados: T[];
  paginacao: MetadadosPaginacao;
}

function paraInteiroPositivo(valor: string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor.trim() === '') return null;
  const numero = Number(valor);
  if (!Number.isFinite(numero) || !Number.isInteger(numero) || numero <= 0) return null;
  return numero;
}

function decodificarCursor(cursor: string | null): number | null {
  if (!cursor) return null;
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf8');
    const dados = JSON.parse(json);
    const pagina = Number(dados?.pagina);
    return Number.isInteger(pagina) && pagina > 0 ? pagina : null;
  } catch {
    return null;
  }
}

function codificarCursor(pagina: number): string {
  return Buffer.from(JSON.stringify({ pagina }), 'utf8').toString('base64url');
}

/**
 * Lê `page`/`pagina`, `limit`/`limite` e `cursor` de uma URLSearchParams e
 * devolve página, limite e offset já validados e dentro dos limites
 * (limite mínimo 1, máximo LIMITE_MAXIMO; página mínima 1).
 */
export function parsePaginacao(
  searchParams: URLSearchParams | null | undefined,
  opcoes?: { limitePadrao?: number; limiteMaximo?: number }
): ParametrosPaginacao {
  const limitePadrao = opcoes?.limitePadrao ?? LIMITE_PADRAO;
  const limiteMaximo = opcoes?.limiteMaximo ?? LIMITE_MAXIMO;

  const paginaPorCursor = decodificarCursor(searchParams?.get('cursor') ?? null);
  const paginaPorQuery =
    paraInteiroPositivo(searchParams?.get('page') ?? null) ??
    paraInteiroPositivo(searchParams?.get('pagina') ?? null);

  const pagina = paginaPorCursor ?? paginaPorQuery ?? 1;

  const limiteBruto =
    paraInteiroPositivo(searchParams?.get('limit') ?? null) ??
    paraInteiroPositivo(searchParams?.get('limite') ?? null) ??
    limitePadrao;

  const limite = Math.min(Math.max(limiteBruto, 1), limiteMaximo);
  const offset = (pagina - 1) * limite;

  return { pagina, limite, offset };
}

/**
 * Monta o envelope padrão de resposta paginada.
 */
export function montarRespostaPaginada<T>(
  dados: T[],
  totalRegistros: number,
  params: ParametrosPaginacao
): RespostaPaginada<T> {
  const totalPaginas = totalRegistros === 0 ? 0 : Math.ceil(totalRegistros / params.limite);
  const temProximaPagina = params.pagina < totalPaginas;

  return {
    dados,
    paginacao: {
      paginaAtual: params.pagina,
      limite: params.limite,
      totalRegistros,
      totalPaginas,
      temProximaPagina,
      temPaginaAnterior: params.pagina > 1,
      proximoCursor: temProximaPagina ? codificarCursor(params.pagina + 1) : null,
    },
  };
}

/**
 * Conta o total de registros de uma consulta base (SELECT ... FROM ... [WHERE] [GROUP BY] [HAVING]),
 * SEM cláusula ORDER BY/LIMIT, envolvendo-a em uma subconsulta. Isso garante uma contagem
 * correta mesmo quando a consulta original usa GROUP BY/HAVING (ex.: listagens com agregações).
 */
export async function contarTotal(
  pool: { query: (sql: string, params?: unknown[]) => Promise<any> },
  sqlBase: string,
  params: unknown[]
): Promise<number> {
  const [rows]: any = await pool.query(
    `SELECT COUNT(*) AS total FROM (${sqlBase}) AS contagem_paginacao`,
    params
  );
  return Number(rows?.[0]?.total ?? 0);
}
