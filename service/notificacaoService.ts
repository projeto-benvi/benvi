import pool from '@/app/lib/dataBase'; 
import { Notificacao } from '@/model/notificacaoModel';
import { ParametrosPaginacao, RespostaPaginada, contarTotal, montarRespostaPaginada } from '@/app/lib/paginacao';

type NovaNotificacao = Omit<Notificacao, 'id_notificacao' | 'visualizada' | 'data_envio'> & {
  url_acao?: string | null;
  tipo?: string | null;
};

const COLUNAS_NOTIFICACAO = `
  id_notificacao,
  id_usuario,
  titulo,
  descricao,
  url_acao,
  tipo,
  visualizada,
  data_envio`;

export const notificacaoService = {
  async criar(notificacao: NovaNotificacao): Promise<any> {
    const [result]: any = await pool.query(
      'INSERT INTO notificacao (id_usuario, titulo, descricao, url_acao, tipo) VALUES (?, ?, ?, ?, ?)',
      [notificacao.id_usuario, notificacao.titulo, notificacao.descricao, notificacao.url_acao ?? null, notificacao.tipo ?? null]
    );
    return { id_notificacao: result.insertId, ...notificacao, visualizada: false };
  },

  // Antes retornava todas as notificações do usuário de uma vez (SELECT *).
  // Agora é paginada, mantendo notificações não lidas primeiro.
  async listarPorUsuario(idUsuario: number, paginacao: ParametrosPaginacao): Promise<RespostaPaginada<any>> {
    const sqlBase = `SELECT ${COLUNAS_NOTIFICACAO} FROM notificacao WHERE id_usuario = ?`;
    const params = [idUsuario];

    const total = await contarTotal(pool, sqlBase, params);
    const [rows]: any = await pool.query(
      `${sqlBase} ORDER BY visualizada ASC, data_envio DESC LIMIT ? OFFSET ?`,
      [...params, paginacao.limite, paginacao.offset]
    );
    return montarRespostaPaginada(rows, total, paginacao);
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
