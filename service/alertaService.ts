import pool from "@/app/lib/dataBase";
import { Alerta } from "@/model/alertaModel";


export const alertaService = {
  // Criar um alerta (Gerado por um Admin)
  async criar(alerta: Omit<Alerta, 'id_alerta'>): Promise<any> {
    const [result]: any = await pool.query(
      `INSERT INTO alerta (id_notificacao, prioridade, categoria, url_acao, data_expiracao) 
       VALUES (?, ?, ?, ?, ?)`,
      [alerta.id_notificacao,  alerta.prioridade, alerta.categoria, alerta.url_acao || null, alerta.data_expiracao || null]
    );
    return { id_alerta: result.insertId, ...alerta };
  },

  // Listar alertas ativos (que ainda não expiraram)
  async listarAtivos(): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT a.*, n.titulo, n.descricao, n.id_usuario 
       FROM alerta a
       INNER JOIN notificacao n ON a.id_notificacao = n.id_notificacao
       WHERE a.data_expiracao IS NULL OR a.data_expiracao > NOW()
       ORDER BY a.prioridade DESC`
    );
    return rows;
  },

  // Buscar alerta específico por ID
  async buscarPorId(id: number): Promise<Alerta | null> {
    const [rows]: any = await pool.query(
      'SELECT * FROM alerta WHERE id_alerta = ?',
      [id]
    );
    return rows[0] ?? null;
  },

  // Deletar um alerta
  async deletar(id: number): Promise<boolean> {
    const [result]: any = await pool.query(
      'DELETE FROM alerta WHERE id_alerta = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
};