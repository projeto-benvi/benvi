import pool from "@/app/lib/dataBase";
import { CidadeAtendida } from "@/model/cidadeAtendidaModel";

export const cidadeAtendidaService = {
  // Criar uma nova cidade atendida (Ação do Admin)
  async criar(dados: Omit<CidadeAtendida, 'id_cidade'>): Promise<any> {
    const [result]: any = await pool.query(
      'INSERT INTO cidadeatendida (id_parceria, cidade, estado, acesso_gratuito) VALUES (?, ?, ?, ?)',
      [dados.id_parceria, dados.cidade, dados.estado, dados.acesso_gratuito]
    );
    return { id_cidade: result.insertId, ...dados };
  },

  // Listar todas as cidades atendidas
  async listarTodas(): Promise<CidadeAtendida[]> {
    const [rows]: any = await pool.query('SELECT * FROM cidadeatendida ORDER BY cidade ASC');
    return rows;
  },

  // Buscar uma cidade específica por ID
  async buscarPorId(id: number): Promise<CidadeAtendida | null> {
    const [rows]: any = await pool.query(
      'SELECT * FROM cidadeatendida WHERE id_cidade = ?',
      [id]
    );
    return rows[0] ?? null;
  },

  // Atualizar dados da cidade (Ação do Admin)
  async atualizar(id: number, dados: Omit<CidadeAtendida, 'id_cidade'>): Promise<boolean> {
    const [result]: any = await pool.query(
      `UPDATE cidadeatendida 
       SET id_parceria = ?, cidade = ?, estado = ?, acesso_gratuito = ? 
       WHERE id_cidade = ?`,
      [dados.id_parceria, dados.cidade, dados.estado, dados.acesso_gratuito, id]
    );
    return result.affectedRows > 0;
  },

  // Eliminar uma cidade (Ação do Admin)
  async deletar(id: number): Promise<boolean> {
    const [result]: any = await pool.query(
      'DELETE FROM cidadeatendida WHERE id_cidade = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
};