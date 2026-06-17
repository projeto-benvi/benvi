import pool from '@/app/lib/dataBase';

export async function up(): Promise<void> {
  const sql = `
            CREATE TABLE IF NOT EXISTS parceria (
                id_parceria   INT AUTO_INCREMENT PRIMARY KEY,
                nome_parceiro VARCHAR(255) NOT NULL,
                cidade        VARCHAR(255) NOT NULL,
                estado        VARCHAR(100) NOT NULL,
                status        VARCHAR(50) DEFAULT 'ativo',
                data_inicio   DATE NOT NULL,
                data_fim      DATE
            );
        `;
  await pool.query(sql);
}