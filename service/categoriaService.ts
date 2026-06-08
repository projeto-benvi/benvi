import pool from '@/app/lib/dataBase';

export class CategoriaService {

  async listarTodasCategorias() {
    const query = `
      SELECT id_categoria, nome_categoria
      FROM CATEGORIA
    `;

    const [rows] = await pool.query(query);

    return rows;
  }

}