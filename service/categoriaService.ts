import  pool  from '@/app/lib/dataBase';
export class CategoriaService {
  
  async listarTodasCategorias() {
    const query = `SELECT id_categoria, nome_categoria FROM CATEGORIA`;
    return await pool.query(query);
  }

  async listarCardsServicos(idCategoriaFiltro?: string) {
    let query = `
      SELECT 
          s.id_servico,
          s.titulo,
          s.descricao,
          c.nome_categoria,
          COUNT(s.id_prestador) AS profissionais_disponiveis
      FROM SERVICO s
      INNER JOIN CATEGORIA c ON s.id_categoria = c.id_categoria
    `;

    const params: (string | number | null)[] = [];

    if (idCategoriaFiltro) {
      query += ` WHERE c.id_categoria = ? `;
      params.push(idCategoriaFiltro);
    }

    query += ` GROUP BY s.id_servico, s.titulo, s.descricao, c.nome_categoria`;

    return await pool.query(query, params);
  }
}
