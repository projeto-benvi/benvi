import pool from '@/app/lib/dataBase';
import { TicketSuporte } from '@/model/ticketSuporteModel';
import { notificacaoService } from '@/service/notificacaoService';

type NovoTicket = Omit<TicketSuporte, 'id_ticket' | 'status' | 'resposta_admin' | 'data_abertura' | 'data_encerramento'> & {
  categoria?: string;
  prioridade?: string;
  id_prestador?: number | null;
  id_servico?: number | null;
};

export const ticketSuporteService = {
  async buscarProprietario(id: number): Promise<number | null> {
    const [rows]: any = await pool.query(
      'SELECT id_usuario FROM ticketsuporte WHERE id_ticket = ? LIMIT 1',
      [id]
    );
    return rows[0] ? Number(rows[0].id_usuario) : null;
  },

  async criar(ticket: NovoTicket): Promise<any> {
    const [result]: any = await pool.query(
      'INSERT INTO ticketsuporte (id_usuario, id_prestador, id_servico, titulo, descricao, categoria, prioridade, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [ticket.id_usuario, ticket.id_prestador ?? null, ticket.id_servico ?? null, ticket.titulo, ticket.descricao, ticket.categoria ?? 'geral', ticket.prioridade ?? 'media', 'aberto']
    );
    await pool.query(
      'INSERT INTO ticketsuporte_interacao (id_ticket, id_usuario, mensagem, tipo) VALUES (?, ?, ?, ?)',
      [result.insertId, ticket.id_usuario, ticket.descricao, 'usuario']
    );
    return { id_ticket: result.insertId, ...ticket, status: 'aberto' };
  },

  async listarTodos(): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT t.id_ticket, t.id_usuario, t.id_prestador, t.id_servico, t.titulo,
              t.descricao, t.categoria, t.prioridade, t.status, t.resposta_admin,
              t.data_abertura, t.data_encerramento, t.data_atualizacao,
              u.nome AS nome_usuario, u.email AS email_usuario
         FROM ticketsuporte t
         INNER JOIN usuario u ON t.id_usuario = u.id_usuario
        ORDER BY t.data_atualizacao DESC, t.data_abertura DESC`
    );
    return rows;
  },

  async listarPorUsuario(idUsuario: number): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT id_ticket, id_usuario, id_prestador, id_servico, titulo, descricao,
              categoria, prioridade, status, resposta_admin, data_abertura,
              data_encerramento, data_atualizacao
         FROM ticketsuporte
        WHERE id_usuario = ?
        ORDER BY data_atualizacao DESC, data_abertura DESC`,
      [idUsuario]
    );
    return rows;
  },

  async buscarPorId(id: number): Promise<any | null> {
    const [rows]: any = await pool.query(
      `SELECT id_ticket, id_usuario, id_prestador, id_servico, titulo, descricao,
              categoria, prioridade, status, resposta_admin, data_abertura,
              data_encerramento, data_atualizacao
         FROM ticketsuporte
        WHERE id_ticket = ?`,
      [id]
    );
    if (!rows[0]) return null;
    const [interacoes]: any = await pool.query(
      `SELECT i.id_interacao, i.id_ticket, i.id_usuario, i.mensagem, i.tipo,
              i.data_criacao, u.nome AS nome_usuario
         FROM ticketsuporte_interacao i
         INNER JOIN usuario u ON u.id_usuario = i.id_usuario
        WHERE i.id_ticket = ?
        ORDER BY i.data_criacao ASC`,
      [id]
    );
    return { ...rows[0], interacoes };
  },

  async responderTicket(id: number, status: string, respostaAdmin: string, encerrar: boolean, idUsuarioResposta?: number): Promise<boolean> {
    const dataEncerramento = encerrar || ['resolvido', 'fechado'].includes(String(status).toLowerCase()) ? new Date() : null;
    const [ticketRows]: any = await pool.query(
      'SELECT id_ticket, id_usuario FROM ticketsuporte WHERE id_ticket = ?',
      [id]
    );
    const ticket = ticketRows[0];
    if (!ticket) return false;
    const [result]: any = await pool.query(
      'UPDATE ticketsuporte SET status = ?, resposta_admin = ?, data_encerramento = ?, data_atualizacao = NOW() WHERE id_ticket = ?',
      [status, respostaAdmin, dataEncerramento, id]
    );
    await pool.query(
      'INSERT INTO ticketsuporte_interacao (id_ticket, id_usuario, mensagem, tipo) VALUES (?, ?, ?, ?)',
      [id, idUsuarioResposta || ticket.id_usuario, respostaAdmin, idUsuarioResposta ? 'admin' : 'sistema']
    );
    await notificacaoService.criar({
      id_usuario: ticket.id_usuario,
      titulo: 'Atualização no seu ticket',
      descricao: 'Seu chamado #' + id + ' foi atualizado para ' + status + '.',
      url_acao: '/ajuda',
      tipo: 'ticket',
    });
    return result.affectedRows > 0;
  },

  async deletar(id: number): Promise<boolean> {
    await pool.query('DELETE FROM ticketsuporte_interacao WHERE id_ticket = ?', [id]);
    const [result]: any = await pool.query('DELETE FROM ticketsuporte WHERE id_ticket = ?', [id]);
    return result.affectedRows > 0;
  }
};
