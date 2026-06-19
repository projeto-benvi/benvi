import pool from '@/app/lib/dataBase';
import { Prestador } from '@/model/prestador';

export const prestadorService = {

  async listarTodos() {
    const [rows] = await pool.query(
      `SELECT p.*, u.nome, u.email, u.telefone, u.foto_perfil, u.cidade, u.status_conta
       FROM prestador p
       INNER JOIN usuario u ON p.id_usuario = u.id_usuario`
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
        COALESCE(AVG(a.nota), 0) AS media_nota,
        COUNT(a.id_avaliacao) AS total_avaliacoes
       FROM usuario u
       INNER JOIN prestador p ON u.id_usuario = p.id_usuario
       LEFT JOIN avaliacao a ON p.id_usuario = a.id_prestador
       GROUP BY 
        u.id_usuario, 
        u.nome, 
        u.foto_perfil, 
        p.categoria_principal
       ORDER BY media_nota DESC, total_avaliacoes DESC
       LIMIT 10`
    );
    return rows;
  },

  async buscarPorId(id: number) {
    const [rows]: any = await pool.query(
      `SELECT p.*, u.nome, u.email, u.telefone, u.foto_perfil, u.cidade, u.status_conta
       FROM prestador p
       INNER JOIN usuario u ON p.id_usuario = u.id_usuario
       WHERE p.id_usuario = ?`, [id]
    );

    const prestador = rows[0];
    if (!prestador) return null;

    const [categorias]: any = await pool.query(
      `SELECT c.id_categoria, c.nome_categoria 
       FROM tag t
       INNER JOIN categoria c ON t.id_categoria = c.id_categoria
       WHERE t.id_prestador = ?`, [id]
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

  async criar(dados: Prestador): Promise<number> {
    await pool.query(
      `INSERT INTO prestador 
      (id_usuario, descricao_profissional, status_verificado, status_social, impulsiona_perfil, categoria_principal) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        dados.id_usuario,
        dados.descricao_profissional ?? null,
        dados.status_verificado ?? false,
        dados.status_social ?? 'ativo',
        dados.impulsiona_perfil ?? false,
        dados.categoria_principal ?? null
      ]
    );
    return dados.id_usuario!;
  },

  async atualizar(id: number, dados: Partial<Prestador>): Promise<void> {
    const camposPermitidos = [
      'descricao_profissional',
      'status_verificado',
      'status_social',
      'impulsiona_perfil',
      'categoria_principal'
    ];

    const camposParaAtualizar: string[] = [];
    const valores: any[] = [];

    camposPermitidos.forEach(campo => {
      if (dados[campo as keyof Partial<Prestador>] !== undefined) {
        camposParaAtualizar.push(`${campo} = ?`);
        valores.push(dados[campo as keyof Partial<Prestador>]);
      }
    });

    if (camposParaAtualizar.length === 0) return;

    valores.push(id);
    await pool.query(
      `UPDATE prestador SET ${camposParaAtualizar.join(', ')} WHERE id_prestador = ?`, valores
    );
  },

  async atualizarPorIdUsuario(id_usuario: number, dados: Partial<Prestador>): Promise<void> {
    const camposPermitidos = [
      'descricao_profissional',
      'status_verificado',
      'status_social',
      'impulsiona_perfil',
      'categoria_principal'
    ];

    const camposParaAtualizar: string[] = [];
    const valores: any[] = [];

    camposPermitidos.forEach(campo => {
      if (dados[campo as keyof Partial<Prestador>] !== undefined) {
        camposParaAtualizar.push(`${campo} = ?`);
        valores.push(dados[campo as keyof Partial<Prestador>]);
      }
    });

    if (camposParaAtualizar.length === 0) return;

    valores.push(id_usuario);
    await pool.query(
      `UPDATE prestador SET ${camposParaAtualizar.join(', ')} WHERE id_usuario = ?`, valores
    );
  },

  async deletar(id: number): Promise<void> {
    await pool.query(
      'DELETE FROM prestador WHERE id_usuario = ?', [id]
    );
  }
};