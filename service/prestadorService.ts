import pool from '@/app/lib/dataBase';
import { Prestador } from '@/model/prestador';

type PrestadorComTags = Prestador & { id_categorias?: number[] };

type FiltrosPrestador = {
  search?: string;
  location?: string;
  categoria?: string;
  apenasVerificados?: boolean;
};

async function garantirTabelaTagPrestador() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tag (
      id_tag INT AUTO_INCREMENT PRIMARY KEY,
      id_prestador INT NOT NULL,
      id_categoria INT NOT NULL,
      data_vinculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_prestador_categoria (id_prestador, id_categoria)
    )
  `);

  const [colunas]: any = await pool.query('SHOW COLUMNS FROM tag');
  const nomes = new Set(colunas.map((coluna: { Field: string }) => coluna.Field));

  if (!nomes.has('id_prestador') || !nomes.has('id_categoria')) {
    await pool.query('DROP TABLE tag');
    await pool.query(`
      CREATE TABLE tag (
        id_tag INT AUTO_INCREMENT PRIMARY KEY,
        id_prestador INT NOT NULL,
        id_categoria INT NOT NULL,
        data_vinculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_prestador_categoria (id_prestador, id_categoria)
      )
    `);
  }
}

async function salvarTagsPrestador(idPrestador: number, idsCategorias: unknown) {
  if (!Array.isArray(idsCategorias)) return;

  await garantirTabelaTagPrestador();

  const idsUnicos = Array.from(
    new Set(idsCategorias.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))
  );

  await pool.query('DELETE FROM tag WHERE id_prestador = ?', [idPrestador]);

  for (const idCategoria of idsUnicos) {
    try {
      await pool.query(
        'INSERT IGNORE INTO tag (id_categoria, id_prestador) VALUES (?, ?)',
        [idCategoria, idPrestador]
      );
    } catch (error) {
      console.error('ERRO AO INSERIR TAG DO PRESTADOR:', error);
    }
  }
}

export const prestadorService = {

  async listarTodos(filtros: FiltrosPrestador = {}) {
    const params: unknown[] = [];
    const whereParts: string[] = [];
    const termo = filtros.search?.trim();
    const localizacao = filtros.location?.trim();
    const categoria = filtros.categoria?.trim();

    if (termo) {
      const termoLike = `%${termo}%`;
      whereParts.push(`(
        u.nome LIKE ?
        OR u.cidade LIKE ?
        OR p.categoria_principal LIKE ?
        OR p.descricao_profissional LIKE ?
        OR tags.categorias_vinculadas LIKE ?
        OR servicos.servicos_busca LIKE ?
      )`);
      params.push(termoLike, termoLike, termoLike, termoLike, termoLike, termoLike);
    }

    if (localizacao) {
      whereParts.push('u.cidade LIKE ?');
      params.push(`%${localizacao}%`);
    }

    if (categoria && categoria !== 'Todas') {
      whereParts.push('(p.categoria_principal = ? OR tags.categorias_vinculadas LIKE ?)');
      params.push(categoria, `%${categoria}%`);
    }

    if (filtros.apenasVerificados) {
      whereParts.push('p.status_verificado = 1');
    }

    const whereClause = whereParts.length ? ` WHERE ${whereParts.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT
        p.*,
        u.nome,
        u.email,
        u.telefone,
        u.foto_perfil,
        u.cidade,
        u.status_conta,
        COALESCE(av.media_nota, 0) AS media_nota,
        COALESCE(av.total_avaliacoes, 0) AS total_avaliacoes,
        COALESCE(sv.servicos_concluidos, 0) AS servicos_concluidos,
        tags.categorias_vinculadas,
        servicos.servicos_busca
       FROM prestador p
       INNER JOIN usuario u ON p.id_usuario = u.id_usuario
       LEFT JOIN (
        SELECT
          a.id_prestador,
          AVG(a.nota) AS media_nota,
          COUNT(a.id_avaliacao) AS total_avaliacoes
        FROM avaliacao a
        GROUP BY a.id_prestador
       ) av ON av.id_prestador = p.id_usuario
       LEFT JOIN (
        SELECT
          s.id_prestador,
          COUNT(*) AS servicos_concluidos
        FROM servico s
        WHERE LOWER(s.status_servico) IN ('concluido', 'concluído')
        GROUP BY s.id_prestador
       ) sv ON sv.id_prestador = p.id_usuario
       LEFT JOIN (
        SELECT
          t.id_prestador,
          GROUP_CONCAT(DISTINCT c.nome_categoria ORDER BY c.nome_categoria SEPARATOR ', ') AS categorias_vinculadas
        FROM tag t
        INNER JOIN categoria c ON c.id_categoria = t.id_categoria
        GROUP BY t.id_prestador
       ) tags ON tags.id_prestador = p.id_usuario
       LEFT JOIN (
        SELECT
          s.id_prestador,
          GROUP_CONCAT(DISTINCT CONCAT_WS(' ', s.titulo, s.descricao, c.nome_categoria) SEPARATOR ' ') AS servicos_busca
        FROM servico s
        LEFT JOIN categoria c ON c.id_categoria = s.id_categoria
        GROUP BY s.id_prestador
       ) servicos ON servicos.id_prestador = p.id_usuario
       ${whereClause}
       ORDER BY p.impulsiona_perfil DESC, av.media_nota DESC, u.nome ASC`,
      params
    );
    return rows;
  },

  async listarDestaques() {
    const [rows] = await pool.query(
      `SELECT 
        u.id_usuario,
        u.nome,
        u.foto_perfil,
        p.categoria_principal,
        tags.categorias_vinculadas,
        COALESCE(AVG(a.nota), 0) AS media_nota,
        COUNT(a.id_avaliacao) AS total_avaliacoes
       FROM usuario u
       INNER JOIN prestador p ON u.id_usuario = p.id_usuario
       LEFT JOIN avaliacao a ON p.id_usuario = a.id_prestador
       LEFT JOIN (
        SELECT
          t.id_prestador,
          GROUP_CONCAT(DISTINCT c.nome_categoria ORDER BY c.nome_categoria SEPARATOR ', ') AS categorias_vinculadas
        FROM tag t
        INNER JOIN categoria c ON c.id_categoria = t.id_categoria
        GROUP BY t.id_prestador
       ) tags ON tags.id_prestador = p.id_usuario
       GROUP BY 
        u.id_usuario, 
        u.nome, 
        u.foto_perfil, 
        p.categoria_principal,
        tags.categorias_vinculadas
       ORDER BY media_nota DESC, total_avaliacoes DESC
       LIMIT 5`
    );
    return rows;
  },

  async buscarPorId(id: number) {
    const [rows]: any = await pool.query(
      `SELECT
        p.*,
        u.nome,
        u.email,
        u.telefone,
        u.foto_perfil,
        u.cidade,
        u.status_conta,
        COALESCE(av.media_nota, 0) AS media_nota,
        COALESCE(av.total_avaliacoes, 0) AS total_avaliacoes,
        COALESCE(sv.servicos_concluidos, 0) AS servicos_concluidos
       FROM prestador p
       INNER JOIN usuario u ON p.id_usuario = u.id_usuario
       LEFT JOIN (
        SELECT
          a.id_prestador,
          AVG(a.nota) AS media_nota,
          COUNT(a.id_avaliacao) AS total_avaliacoes
        FROM avaliacao a
        GROUP BY a.id_prestador
       ) av ON av.id_prestador = p.id_usuario
       LEFT JOIN (
        SELECT
          s.id_prestador,
          COUNT(*) AS servicos_concluidos
        FROM servico s
        WHERE LOWER(s.status_servico) IN ('concluido', 'concluído')
        GROUP BY s.id_prestador
       ) sv ON sv.id_prestador = p.id_usuario
       WHERE p.id_usuario = ?`, [id]
    );

    const prestador = rows[0];
    if (!prestador) return null;

    const [categorias]: any = await pool.query(
      `SELECT c.id_categoria, c.nome_categoria 
       FROM tag t
       INNER JOIN categoria c ON t.id_categoria = c.id_categoria
       WHERE t.id_prestador = ?
       ORDER BY c.nome_categoria ASC`, [id]
    );

    return { ...prestador, categorias_vinculadas: categorias };
  },

  async buscarPorIdUsuario(id_usuario: number) {
    const [rows]: any = await pool.query(
      `SELECT p.*, u.nome, u.email, u.telefone, u.foto_perfil, u.cidade, u.status_conta
       FROM prestador p
       INNER JOIN usuario u ON p.id_usuario = u.id_usuario
       WHERE p.id_usuario = ?`, [id_usuario]
    );
    return rows[0] ?? null;
  },

  async criar(dados: PrestadorComTags): Promise<number> {
    const impulsiona_valor = (dados.is_vulneravel ?? true) ? true : (dados.impulsiona_perfil ?? false);
    const descricaoProfissional =
      typeof dados.descricao_profissional === 'string' && dados.descricao_profissional.trim()
        ? dados.descricao_profissional.trim()
        : null;
    const categoriaPrincipal =
      typeof dados.categoria_principal === 'string' && dados.categoria_principal.trim()
        ? dados.categoria_principal.trim()
        : null;

    await pool.query(
      `INSERT INTO prestador
      (id_usuario, descricao_profissional, status_verificado, status_social, impulsiona_perfil, categoria_principal, is_vulneravel)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        descricao_profissional = COALESCE(NULLIF(VALUES(descricao_profissional), ''), descricao_profissional),
        categoria_principal = COALESCE(NULLIF(VALUES(categoria_principal), ''), categoria_principal),
        is_vulneravel = VALUES(is_vulneravel)`,
      [
        dados.id_usuario,
        descricaoProfissional,
        dados.status_verificado ?? false,
        dados.status_social ?? 'ativo',
        impulsiona_valor,
        categoriaPrincipal,
        dados.is_vulneravel ?? false
      ]
    );

    await salvarTagsPrestador(dados.id_usuario!, dados.id_categorias);
    return dados.id_usuario!;
  },

  async atualizar(id: number, dados: Partial<Prestador>): Promise<void> {
    const camposPermitidos = [
      'descricao_profissional',
      'status_verificado',
      'status_social',
      'impulsiona_perfil',
      'categoria_principal',
      'is_vulneravel'
    ];

    const camposParaAtualizar: string[] = [];
    const valores: any[] = [];

    camposPermitidos.forEach(campo => {
      if (dados[campo as keyof Partial<Prestador>] !== undefined) {
        camposParaAtualizar.push(campo + ' = ?');
        valores.push(dados[campo as keyof Partial<Prestador>]);
      }
    });

    if (dados.is_vulneravel === true && !camposParaAtualizar.includes('impulsiona_perfil = ?')) {
      camposParaAtualizar.push('impulsiona_perfil = ?');
      valores.push(true);
    }

    if (camposParaAtualizar.length === 0) return;

    valores.push(id);
    await pool.query(
      'UPDATE prestador SET ' + camposParaAtualizar.join(', ') + ' WHERE id_usuario = ?', valores
    );
  },

  async atualizarPorIdUsuario(id_usuario: number, dados: Partial<Prestador>): Promise<void> {
    const camposPermitidos = [
      'descricao_profissional',
      'status_verificado',
      'status_social',
      'impulsiona_perfil',
      'categoria_principal',
      'is_vulneravel'
    ];

    const camposParaAtualizar: string[] = [];
    const valores: any[] = [];

    camposPermitidos.forEach(campo => {
      if (dados[campo as keyof Partial<Prestador>] !== undefined) {
        camposParaAtualizar.push(campo + ' = ?');
        valores.push(dados[campo as keyof Partial<Prestador>]);
      }
    });

    if (dados.is_vulneravel === true && !camposParaAtualizar.includes('impulsiona_perfil = ?')) {
      camposParaAtualizar.push('impulsiona_perfil = ?');
      valores.push(true);
    }

    if (camposParaAtualizar.length === 0) return;

    valores.push(id_usuario);
    await pool.query(
      'UPDATE prestador SET ' + camposParaAtualizar.join(', ') + ' WHERE id_usuario = ?', valores
    );
  },

  async deletar(id: number): Promise<void> {
    await pool.query(
      'DELETE FROM prestador WHERE id_usuario = ?', [id]
    );
  }
};
