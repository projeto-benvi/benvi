import pool from '@/app/lib/dataBase';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

// Definição da sua interface gráfica do banco
export interface Avaliacao {
  id_avaliacao?: number;
  nota: number;
  comentario: string;
  data_avaliacao?: Date;
}

export const AvaliacaoModel = {
  // Buscar todas as avaliações (Tipado como um array de Avaliacao)
  async getAll(): Promise<Avaliacao[]> {
    try {
      // Forçamos o retorno do array a seguir a estrutura RowDataPacket & Avaliacao
      const [rows] = await pool.query<(RowDataPacket & Avaliacao)[]>(
        'SELECT id_avaliacao, nota, comentario, data_avaliacao FROM avaliacao ORDER BY data_avaliacao DESC'
      );
      return rows;
    } catch (error) {
      console.error('Erro no modelo getAll:', error);
      throw error;
    }
  },

  // Criar uma nova avaliação (Retorna o id_avaliacao numérico)
  async create(nota: number, comentario: string): Promise<number> {
    try {
      // O INSERT sempre retorna um ResultSetHeader na primeira posição
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO avaliacao (nota, comentario) VALUES (?, ?)',
        [nota, comentario]
      );
      
      // Agora o TypeScript reconhece o insertId perfeitamente sem erros
      return result.insertId; 
    } catch (error) {
      console.error('Erro no modelo create:', error);
      throw error;
    }
  },

  // Deletar uma avaliação pelo ID
  async delete(id_avaliacao: number): Promise<boolean> {
    try {
      await pool.query('DELETE FROM avaliacao WHERE id_avaliacao = ?', [id_avaliacao]);
      return true;
    } catch (error) {
      console.error('Erro no modelo delete:', error);
      throw error;
    }
  }
};

export interface Avaliacao {
  id_avaliacao?: number;
  //id_cliente: number;
  //id_prestador: number;
  //id_solicitação: number;
  nota: number;
  comentario: string;
  data_avaliacao?: Date;
}