import pool from '@/app/lib/dataBase';
import { FavoritoModel } from '@/model/favoritoModel';

type OrdenacaoFavorito = 'mais-recentes' | 'melhor-avaliados' | 'nome';

interface ListaFavoritosFiltros {
  termo?: string;
  categoria?: string;
  cidade?: string;
  notaMinima?: number;
  ordenarPor?: OrdenacaoFavorito;
  servicos?: string[];
}

export const favoritoService = {
  async listarPorUsuario(id_usuario: number, filtros?: ListaFavoritosFiltros) {
    const termo = filtros?.termo?.trim();
    const categoria = filtros?.categoria?.trim();
    const cidade = filtros?.cidade?.trim();
    const notaMinima = filtros?.notaMinima;
    const servicos = (filtros?.servicos || []).map((s) => s.trim()).filter(Boolean);

    const params: any[] = [id_usuario];
    const whereParts: string[] = ['f.id_usuario = ?'];

    if (termo) {
      whereParts.push(`(
        u.nome LIKE ?
        OR p.categoria_principal LIKE ?
        OR u.cidade LIKE ?
        OR p.descricao_profissional LIKE ?
        OR EXISTS (
          SELECT 1
          FROM servico st
          WHERE st.id_prestador = p.id_usuario
            AND (
              st.titulo LIKE ?
              OR st.descricao LIKE ?
            )
        )
      )`);

      const termoLike = `%${termo}%`;
      params.push(termoLike, termoLike, termoLike, termoLike, termoLike, termoLike);
    }

    if (categoria) {
      whereParts.push('p.categoria_principal LIKE ?');
      params.push(`%${categoria}%`);
    }

    if (cidade) {
      whereParts.push('u.cidade LIKE ?');
      params.push(`%${cidade}%`);
    }

    if (servicos.length > 0) {
      const servicosSql = servicos
        .map(() => `EXISTS (
          SELECT 1
          FROM servico sf
          WHERE sf.id_prestador = p.id_usuario
            AND (
              sf.titulo LIKE ?
              OR sf.descricao LIKE ?
            )
        )`)
        .join(' OR ');

      whereParts.push(`(${servicosSql})`);
      servicos.forEach((servico) => {
        const termoServico = `%${servico}%`;
        params.push(termoServico, termoServico);
      });
    }

    const havingParts: string[] = [];
    if (typeof notaMinima === 'number' && !Number.isNaN(notaMinima) && notaMinima > 0) {
      havingParts.push('COALESCE(AVG(a.nota), 0) >= ?');
      params.push(notaMinima);
    }

    const ordenarPor = filtros?.ordenarPor || 'mais-recentes';
    const orderByMap: Record<OrdenacaoFavorito, string> = {
      'mais-recentes': 'f.data_favorito DESC',
      'melhor-avaliados': 'media_nota DESC, total_avaliacoes DESC',
      nome: 'u.nome ASC'
    };
    const orderBy = orderByMap[ordenarPor] || orderByMap['mais-recentes'];

    const sql = `
      SELECT
        f.id_favorito,
        f.id_usuario,
        f.id_prestador,
        f.data_favorito,
        u.nome,
        u.foto_perfil,
        u.cidade,
        p.categoria_principal,
        p.descricao_profissional,
        COALESCE(AVG(a.nota), 0) AS media_nota,
        COUNT(DISTINCT a.id_avaliacao) AS total_avaliacoes,
        COALESCE(
          GROUP_CONCAT(
            DISTINCT s.titulo
            ORDER BY s.titulo ASC
            SEPARATOR '||'
          ),
          ''
        ) AS servicos_oferecidos
      FROM favorito f
      INNER JOIN prestador p ON p.id_usuario = f.id_prestador
      INNER JOIN usuario u ON u.id_usuario = p.id_usuario
      LEFT JOIN avaliacao a ON a.id_prestador = p.id_usuario
      LEFT JOIN servico s ON s.id_prestador = p.id_usuario
      WHERE ${whereParts.join(' AND ')}
      GROUP BY
        f.id_favorito,
        f.id_usuario,
        f.id_prestador,
        f.data_favorito,
        u.nome,
        u.foto_perfil,
        u.cidade,
        p.categoria_principal,
        p.descricao_profissional
      ${havingParts.length > 0 ? `HAVING ${havingParts.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async buscarPorId(id_favorito: number) {
    const [rows]: any = await pool.query(
      `SELECT id_favorito, id_usuario, id_prestador, data_favorito
       FROM favorito
       WHERE id_favorito = ?`,
      [id_favorito]
    );

    return rows[0] ?? null;
  },

  async criar(dados: FavoritoModel): Promise<number> {
    const [result]: any = await pool.query(
      `INSERT INTO favorito (id_usuario, id_prestador)
       VALUES (?, ?)`,
      [dados.id_usuario, dados.id_prestador]
    );

    return result.insertId;
  },

  async deletarPorId(id_favorito: number): Promise<void> {
    await pool.query('DELETE FROM favorito WHERE id_favorito = ?', [id_favorito]);
  },

  async deletarPorUsuarioPrestador(id_usuario: number, id_prestador: number): Promise<void> {
    await pool.query(
      'DELETE FROM favorito WHERE id_usuario = ? AND id_prestador = ?',
      [id_usuario, id_prestador]
    );
  }
};
