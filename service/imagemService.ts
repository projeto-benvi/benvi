import pool from '@/app/lib/dataBase';
import { Imagem } from '@/model/imagemModel';


export const imagemService = {

  // Lista todas as imagens
  async listarTodas(): Promise<Imagem[]> {
    const [rows]: any = await pool.query(
      'SELECT id_imagem, id_servico, url FROM imagem'
    );
    return rows as Imagem[];
  },

  // Busca imagem por ID
  async buscarPorId(id: number): Promise<Imagem | null> {
    const [rows]: any = await pool.query(
       'SELECT * FROM imagem WHERE id_imagem = ?',
      [id]
    );
    return rows[0] ?? null;
  },

  // Busca imagens por serviço (FK)
  async buscarPorServico(id_servico: number): Promise<Imagem[]> {
    const [rows]: any = await pool.query(
      'SELECT * FROM imagem WHERE id_imagem = ?',
      [id_servico]
    );
    return rows as Imagem[];
  },

  // Cria nova imagem
  async criar(dados: Omit<Imagem, 'id_imagem'>): Promise<number> {
    
     await pool.query(
        Imagem.createTableQuery()
    );
    
    
    const [result]: any = await pool.query(
      `
        INSERT INTO imagem (
            id_servico,
            url
        )
        VALUES (?, ?)
        `,
      [
        dados.id_servico,
        dados.url
      ]
    );

    return result.insertId;
  },

  // Atualiza imagem
  async atualizar(id: number, dados: Partial<Imagem>): Promise<void> {
    const campos = Object.keys(dados)
      .map(k => `${k} = ?`)
      .join(', ');

    const valores = [...Object.values(dados), id];

    await pool.query(
      `UPDATE imagem SET ${campos} WHERE id_imagem = ?`,
      valores
    );
  },

  // Deleta imagem
  async deletar(id: number): Promise<void> {
    await pool.query(
      'DELETE FROM imagem WHERE id_imagem = ?',
      [id]
    );
  }
};