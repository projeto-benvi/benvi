import pool from '@/app/lib/dataBase';
import { Prestador } from '@/model/prestador';

export const prestadorService = {

  // Busca todos os prestadores com dados do usuário
  async listarTodos() {
    const [rows] = await pool.query(
      `SELECT p.*, u.nome, u.email, u.telefone, u.foto_perfil, u.cidade, u.status_conta
       FROM prestador p
       INNER JOIN usuario u ON p.id_usuario = u.id_usuario`
    );
    return rows;
  },

  // Busca um prestador pelo id
  async buscarPorId(id: number) {
    const [rows]: any = await pool.query(
      `SELECT p.*, u.nome, u.email, u.telefone, u.foto_perfil, u.cidade, u.status_conta
       FROM prestador p
       INNER JOIN usuario u ON p.id_usuario = u.id_usuario
       WHERE p.id_prestador = ?`, [id]
    );
    return rows[0] ?? null;
  },

  // Busca prestador pelo id do usuário
  async buscarPorIdUsuario(id_usuario: number) {
    const [rows]: any = await pool.query(
      `SELECT p.*, u.nome, u.email, u.telefone, u.foto_perfil, u.cidade, u.status_conta
       FROM prestador p
       INNER JOIN usuario u ON p.id_usuario = u.id_usuario
       WHERE p.id_usuario = ?`, [id_usuario]
    );
    return rows[0] ?? null;
  },

  // Cria um novo prestador
  async criar(dados: Prestador): Promise<number> {
    const [result]: any = await pool.query(
      `INSERT INTO prestador 
        (id_usuario, descricao_profissional, status_verificado, status_social, impulsiona_perfil, categoria_principal)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        dados.id_usuario,
        dados.descricao_profissional,
        dados.status_verificado ?? false,
        dados.status_social ?? 'ativo',
        dados.impulsiona_perfil ?? false,
        dados.categoria_principal
      ]
    );
    return result.insertId;
  },

  // Atualiza dados do prestador
  async atualizar(id: number, dados: Partial<Prestador>): Promise<void> {
    const campos = Object.keys(dados).map(k => `${k} = ?`).join(', ');
    const valores = [...Object.values(dados), id];
    await pool.query(
      `UPDATE prestador SET ${campos} WHERE id_prestador = ?`, valores
    );
  },

  // Deleta um prestador
  async deletar(id: number): Promise<void> {
    await pool.query(
      'DELETE FROM prestador WHERE id_prestador = ?', [id]
    );
  }
};