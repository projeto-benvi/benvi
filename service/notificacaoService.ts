import pool from '@/app/lib/dataBase'; 
import { DEFAULT_NOTIFICATION_TARGET, normalizeInternalNavigationTarget } from '@/app/lib/internal-navigation';
import { Notificacao } from '@/model/notificacaoModel';

type NovaNotificacao = Omit<Notificacao, 'id_notificacao' | 'visualizada' | 'data_envio'> & {
  url_acao?: string | null;
  tipo?: string | null;
};

export const notificacaoService = {
  async criar(notificacao: NovaNotificacao): Promise<any> {
    const rawUrlAcao = typeof notificacao.url_acao === 'string' ? notificacao.url_acao.trim() : notificacao.url_acao;
    const normalizedUrlAcao = normalizeInternalNavigationTarget(rawUrlAcao);
    const urlAcao = !rawUrlAcao
      ? null
      : normalizedUrlAcao ?? DEFAULT_NOTIFICATION_TARGET;

    const [result]: any = await pool.query(
      'INSERT INTO notificacao (id_usuario, titulo, descricao, url_acao, tipo) VALUES (?, ?, ?, ?, ?)',
      [notificacao.id_usuario, notificacao.titulo, notificacao.descricao, urlAcao, notificacao.tipo ?? null]
    );
    return { id_notificacao: result.insertId, ...notificacao, url_acao: urlAcao, visualizada: false };
  },

  async listarPorUsuario(idUsuario: number): Promise<any[]> {
    const [rows]: any = await pool.query(
      'SELECT * FROM notificacao WHERE id_usuario = ? ORDER BY visualizada ASC, data_envio DESC',
      [idUsuario]
    );
    return rows;
  },

  async buscarPorId(id: number): Promise<any | null> {
    const [rows]: any = await pool.query('SELECT * FROM notificacao WHERE id_notificacao = ?', [id]);
    return rows[0] ?? null;
  },

  async marcarComoVisualizada(id: number): Promise<boolean> {
    const [result]: any = await pool.query('UPDATE notificacao SET visualizada = true WHERE id_notificacao = ?', [id]);
    return result.affectedRows > 0;
  },

  async deletar(id: number): Promise<boolean> {
    const [result]: any = await pool.query('DELETE FROM notificacao WHERE id_notificacao = ?', [id]);
    return result.affectedRows > 0;
  }
};
