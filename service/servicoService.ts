import pool from '@/app/lib/dataBase';
import { Servico } from '@/model/servicoModel';

export const servicoService = {

// Substitua apenas este método dentro do seu servicoService.ts
  async listarTodos(): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT 
        s.id_servico,
        s.id_prestador,
        s.id_categoria,
        s.titulo,
        s.descricao,
        s.status_servico,
        s.data_inicio,
        s.data_fim,
        s.imagens,
        p.descricao_profissional,
        p.categoria_principal,
        p.status_verificado,
        u.nome AS nome_prestador,
        u.email AS email_prestador,
        u.telefone AS telefone_prestador,
        u.foto_perfil AS foto_prestador,
        u.cidade AS cidade_prestador
       FROM servico s
       LEFT JOIN prestador p ON s.id_prestador = p.id_usuario
       LEFT JOIN usuario u ON p.id_usuario = u.id_usuario`
    );
    return rows as any[];
  },

  // 2. CORRIGIDO: Busca por ID trazendo a mesma estrutura limpa de dados conectados
  async buscarPorId(id: number): Promise<any | null> {
    const [rows]: any = await pool.query(
      `SELECT 
        s.id_servico,
        s.id_prestador,
        s.id_categoria,
        s.titulo,
        s.descricao,
        s.status_servico,
        s.data_inicio,
        s.data_fim,
        s.imagens,
        p.descricao_profissional,
        p.categoria_principal,
        p.status_verificado,
        u.nome AS nome_prestador,
        u.email AS email_prestador,
        u.telefone AS telefone_prestador,
        u.foto_perfil AS foto_prestador,
        u.cidade AS cidade_prestador
       FROM servico s
       LEFT JOIN prestador p ON s.id_prestador = p.id_usuario
       LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
       WHERE s.id_servico = ?`, [id]
    );
    return rows[0] ?? null;
  },

  // Busca todos os serviços de um prestador específico
  async buscarPorPrestador(idPrestador: number): Promise<Servico[]> {
    const [rows] = await pool.query(
      `SELECT * FROM servico WHERE id_prestador = ?`, [idPrestador]
    );
    return rows as Servico[];
  },

  // Cria un novo serviço
  async criar(dados: Omit<Servico, 'id_servico'>): Promise<number> {
    await pool.query(Servico.createTableQuery()); 

    const queryInsert = `
      INSERT INTO servico (
        id_prestador, id_categoria, titulo, descricao, status_servico, data_inicio, data_fim, imagens
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result]: any = await pool.query(queryInsert, [
      dados.id_prestador ?? null,
      dados.id_categoria ?? null,
      dados.titulo,
      dados.descricao,
      dados.status_servico ?? 'ativo',
      dados.data_inicio ?? null,
      dados.data_fim ?? null,
      JSON.stringify(dados.imagens ?? [])
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
}