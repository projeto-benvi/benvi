import pool from "@/app/lib/dataBase";
import { TicketSuporte } from "@/model/ticketSuporteModel";

export const ticketSuporteService = {
  // Criar ticket (Ação do Usuário)
  async criar(ticket: Omit<TicketSuporte, 'id_ticket' | 'status' | 'resposta_admin' | 'data_abertura' | 'data_encerramento'>): Promise<any> {
    const [result]: any = await pool.query(
      'INSERT INTO ticketsuporte (id_usuario, titulo, descricao) VALUES (?, ?, ?)',
      [ticket.id_usuario, ticket.titulo, ticket.descricao]
    );
    return { id_ticket: result.insertId, ...ticket, status: 'Aberto' };
  },

  // Listar todos os tickets do sistema (Ação do Admin)
  async listarTodos(): Promise<TicketSuporte[]> {
    const [rows]: any = await pool.query('SELECT * FROM ticketsuporte ORDER BY data_abertura DESC');
    return rows;
  },

  // Listar tickets de um usuário específico (Ação do Usuário no seu painel)
  async listarPorUsuario(idUsuario: number): Promise<TicketSuporte[]> {
    const [rows]: any = await pool.query(
      'SELECT * FROM ticketsuporte WHERE id_usuario = ? ORDER BY data_abertura DESC',
      [idUsuario]
    );
    return rows;
  },

  // Buscar um ticket específico por ID
  async buscarPorId(id: number): Promise<TicketSuporte | null> {
    const [rows]: any = await pool.query(
      'SELECT * FROM ticketsuporte WHERE id_ticket = ?',
      [id]
    );
    return rows[0] ?? null;
  },

  // Responder/Atualizar status do ticket (Ação do Admin)
  async responderTicket(id: number, status: string, respostaAdmin: string, encerrar: boolean): Promise<boolean> {
    const dataEncerramento = encerrar ? new Date() : null;
    
    const [result]: any = await pool.query(
      `UPDATE ticketsuporte 
       SET status = ?, resposta_admin = ?, data_encerramento = ? 
       WHERE id_ticket = ?`,
      [status, respostaAdmin, dataEncerramento, id]
    );
    return result.affectedRows > 0;
  },

  // Deletar ticket
  async deletar(id: number): Promise<boolean> {
    const [result]: any = await pool.query(
      'DELETE FROM ticketsuporte WHERE id_ticket = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
};