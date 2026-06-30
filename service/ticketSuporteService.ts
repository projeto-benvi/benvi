import pool from '@/app/lib/dataBase';
import { TicketSuporte } from '@/model/ticketSuporteModel';
import { notificacaoService } from '@/service/notificacaoService';

async function garantirTabelaTickets() {
  await pool.query(
    'CREATE TABLE IF NOT EXISTS ticketsuporte (' +
      'id_ticket INT AUTO_INCREMENT PRIMARY KEY,' +
      'id_usuario INT NOT NULL,' +
      'id_prestador INT NULL,' +
      'id_servico INT NULL,' +
      'titulo VARCHAR(255) NOT NULL,' +
      'descricao TEXT NOT NULL,' +
      "categoria VARCHAR(100) NOT NULL DEFAULT 'geral'," +
      "prioridade VARCHAR(30) NOT NULL DEFAULT 'media'," +
      "status VARCHAR(50) NOT NULL DEFAULT 'aberto'," +
      'resposta_admin TEXT NULL,' +
      'data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP,' +
      'data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,' +
      'data_encerramento DATETIME NULL' +
    ')'
  );

  const [colunas]: any = await pool.query('SHOW COLUMNS FROM ticketsuporte');
  const nomes = new Set(colunas.map((coluna: { Field: string }) => coluna.Field));
  if (!nomes.has('id_prestador')) await pool.query('ALTER TABLE ticketsuporte ADD COLUMN id_prestador INT NULL');
  if (!nomes.has('id_servico')) await pool.query('ALTER TABLE ticketsuporte ADD COLUMN id_servico INT NULL');
  if (!nomes.has('categoria')) await pool.query("ALTER TABLE ticketsuporte ADD COLUMN categoria VARCHAR(100) NOT NULL DEFAULT 'geral'");
  if (!nomes.has('prioridade')) await pool.query("ALTER TABLE ticketsuporte ADD COLUMN prioridade VARCHAR(30) NOT NULL DEFAULT 'media'");
  if (!nomes.has('data_atualizacao')) await pool.query('ALTER TABLE ticketsuporte ADD COLUMN data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  await pool.query(
    'CREATE TABLE IF NOT EXISTS ticketsuporte_interacao (' +
      'id_interacao INT AUTO_INCREMENT PRIMARY KEY,' +
      'id_ticket INT NOT NULL,' +
      'id_usuario INT NOT NULL,' +
      'mensagem TEXT NOT NULL,' +
      "tipo VARCHAR(30) NOT NULL DEFAULT 'usuario'," +
      'data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP' +
    ')'
  );
}

type NovoTicket = Omit<TicketSuporte, 'id_ticket' | 'status' | 'resposta_admin' | 'data_abertura' | 'data_encerramento'> & {
  categoria?: string;
  prioridade?: string;
  id_prestador?: number | null;
  id_servico?: number | null;
};

export const ticketSuporteService = {
  async criar(ticket: NovoTicket): Promise<any> {
    await garantirTabelaTickets();
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
    await garantirTabelaTickets();
    const [rows]: any = await pool.query(
      'SELECT t.*, u.nome AS nome_usuario, u.email AS email_usuario FROM ticketsuporte t INNER JOIN usuario u ON t.id_usuario = u.id_usuario ORDER BY t.data_atualizacao DESC, t.data_abertura DESC'
    );
    return rows;
  },

  async listarPorUsuario(idUsuario: number): Promise<any[]> {
    await garantirTabelaTickets();
    const [rows]: any = await pool.query(
      'SELECT * FROM ticketsuporte WHERE id_usuario = ? ORDER BY data_atualizacao DESC, data_abertura DESC',
      [idUsuario]
    );
    return rows;
  },

  async buscarPorId(id: number): Promise<any | null> {
    await garantirTabelaTickets();
    const [rows]: any = await pool.query('SELECT * FROM ticketsuporte WHERE id_ticket = ?', [id]);
    if (!rows[0]) return null;
    const [interacoes]: any = await pool.query(
      'SELECT i.*, u.nome AS nome_usuario FROM ticketsuporte_interacao i INNER JOIN usuario u ON u.id_usuario = i.id_usuario WHERE i.id_ticket = ? ORDER BY i.data_criacao ASC',
      [id]
    );
    return { ...rows[0], interacoes };
  },

  async responderTicket(id: number, status: string, respostaAdmin: string, encerrar: boolean, idUsuarioResposta?: number): Promise<boolean> {
    await garantirTabelaTickets();
    const dataEncerramento = encerrar || ['resolvido', 'fechado'].includes(String(status).toLowerCase()) ? new Date() : null;
    const [ticketRows]: any = await pool.query('SELECT * FROM ticketsuporte WHERE id_ticket = ?', [id]);
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
    await garantirTabelaTickets();
    await pool.query('DELETE FROM ticketsuporte_interacao WHERE id_ticket = ?', [id]);
    const [result]: any = await pool.query('DELETE FROM ticketsuporte WHERE id_ticket = ?', [id]);
    return result.affectedRows > 0;
  }
};
