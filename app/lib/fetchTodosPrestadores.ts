/**
 * Utilitário client-side para telas administrativas que ainda precisam
 * exibir/computar sobre a lista completa de prestadores (ex.: dashboards,
 * contadores, tabelas de gestão).
 *
 * A API /api/prestador agora é paginada (nunca devolve tudo em uma única
 * consulta ao banco). Esta função busca as páginas em sequência, usando o
 * maior limite permitido por página, e concatena o resultado — preservando
 * o comportamento das telas admin sem reintroduzir uma consulta gigante
 * no backend.
 */
export async function fetchTodosPrestadores(paramsExtras?: Record<string, string>): Promise<any[]> {
  const LIMITE_POR_PAGINA = 100;
  const resultado: any[] = [];
  let pagina = 1;
  let temProximaPagina = true;

  while (temProximaPagina) {
    const params = new URLSearchParams(paramsExtras);
    params.set('page', String(pagina));
    params.set('limit', String(LIMITE_POR_PAGINA));

    const res = await fetch(`/api/prestador?${params.toString()}`);
    const json = await res.json();

    const dados = Array.isArray(json) ? json : Array.isArray(json?.dados) ? json.dados : [];
    resultado.push(...dados);

    temProximaPagina = Boolean(json?.paginacao?.temProximaPagina);
    pagina += 1;

    // Salvaguarda contra respostas inesperadas (formato antigo/array puro sem metadados).
    if (!json?.paginacao) break;
  }

  return resultado;
}
