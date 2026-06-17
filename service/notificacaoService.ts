import pool from '@/app/lib/dataBase'; 
import { Notificacao } from '@/model/notificacaoModel';

export const notificacaoService = {
  
  async criar(notificacao: Omit<Notificacao, 'id_notificacao' | 'visualizada' | 'data_envio'>): Promise<any> {
    const [result]: any = await pool.query(
      'INSERT INTO notificacao (id_usuario, titulo, descricao) VALUES (?, ?, ?)',
      [notificacao.id_usuario, notificacao.titulo, notificacao.descricao]
    );
    return { id_notificacao: result.insertId, ...notificacao, visualizada: false };
  },

  async listarPorUsuario(idUsuario: number): Promise<Notificacao[]> {
    const [rows]: any = await pool.query(
      'SELECT * FROM notificacao WHERE id_usuario = ? ORDER BY data_envio DESC',
      [idUsuario]
    );
    return rows;
  },

  async buscarPorId(id: number): Promise<Notificacao | null> {
    const [rows]: any = await pool.query(
      'SELECT * FROM notificacao WHERE id_notificacao = ?',
      [id]
    );
    return rows[0] ?? null;
  },

  async marcarComoVisualizada(id: number): Promise<boolean> {
    const [result]: any = await pool.query(
      'UPDATE notificacao SET visualizada = true WHERE id_notificacao = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  
  async deletar(id: number): Promise<boolean> {
    const [result]: any = await pool.query(
      'DELETE FROM notificacao WHERE id_notificacao = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
};