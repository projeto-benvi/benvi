import pool from '@/app/lib/dataBase';

export async function up(): Promise<void> {
    const sql =  `
      CREATE TABLE IF NOT EXISTS categoria (
        id_categoria INT PRIMARY KEY AUTO_INCREMENT,
        nome_categoria VARCHAR(100) NOT NULL,
        descricao TEXT
      );
    `;
    await pool.query(sql);
}



