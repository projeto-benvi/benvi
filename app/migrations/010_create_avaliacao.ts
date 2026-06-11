// app/migrations/003_create_avaliacao.ts
import pool from '@/app/lib/dataBase';

export async function up(): Promise<void> {
  const sql = `
      CREATE TABLE IF NOT EXISTS avaliacao (
        id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,

        id_usuario INT NOT NULL,
        id_prestador INT NOT NULL,

        nota DECIMAL(2,1) NOT NULL,
        comentario TEXT,

        data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,

       CONSTRAINT fk_avaliacao_usuario
          FOREIGN KEY (id_usuario)
          REFERENCES usuario(id_usuario)
          ON DELETE CASCADE,

       CONSTRAINT fk_avaliacao_prestador
          FOREIGN KEY (id_prestador)
          REFERENCES prestador(id_usuario)
          ON DELETE CASCADE
      );
    `;
  await pool.query(sql);
}