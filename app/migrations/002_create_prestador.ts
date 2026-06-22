
import pool from '@/app/lib/dataBase';

export async function up(): Promise<void> {
  const sql = `
      CREATE TABLE IF NOT EXISTS prestador (
        id_usuario INT PRIMARY KEY,
        descricao_profissional TEXT,
        status_verificado BOOLEAN DEFAULT FALSE,
        status_social VARCHAR(50) DEFAULT 'ativo',
        impulsiona_perfil BOOLEAN DEFAULT FALSE,
        categoria_principal VARCHAR(100),
        CONSTRAINT fk_prestador_usuario 
          FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) 
          ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
  await pool.query(sql);
}