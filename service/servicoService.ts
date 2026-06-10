import pool from '@/app/lib/dataBase';
import { Servico } from '@/model/servicoModel';

export const servicoService = {

  // Busca todos os serviços
  async listarTodos(): Promise<Servico[]> {
    const [rows] = await pool.query(
      `SELECT id_servico, id_prestador, id_categoria, titulo, descricao, 
              status_servico, data_inicio, data_fim 
       FROM servico`
    );
    return rows as Servico[];
  },

  // Busca um serviço pelo id
  async buscarPorId(id: number): Promise<Servico | null> {
    const [rows]: any = await pool.query(
      'SELECT * FROM servico WHERE id_servico = ?', [id]
    );
    return rows[0] ?? null;
  },

// Cria um novo serviço
  async criar(dados: Omit<Servico, 'id_servico'>): Promise<number> {
    await pool.query(Servico.createTableQuery()); 

    const queryInsert = `
      INSERT INTO servico (
        id_prestador, id_categoria, titulo, descricao, status_servico, data_inicio, data_fim
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result]: any = await pool.query(queryInsert, [
      dados.id_prestador ?? null,
      dados.id_categoria ?? null,
      dados.titulo,
      dados.descricao,
      dados.status_servico ?? 'ativo',
      dados.data_inicio ?? null,
      dados.data_fim ?? null
    ]);

    return result.insertId;
  },

  // Atualiza dados do serviço
  async atualizar(id: number, dados: Partial<Servico>): Promise<void> {
    if (Object.keys(dados).length === 0) return;

    const campos = Object.keys(dados).map(k => `${k} = ?`).join(', ');
    const valores = [...Object.values(dados), id];
    
    await pool.query(
      `UPDATE servico SET ${campos} WHERE id_servico = ?`, valores
    );
  },

  // Deleta um serviço
  async deletar(id: number): Promise<void> {
    await pool.query(
      'DELETE FROM servico WHERE id_servico = ?', [id]
    );
  }

};