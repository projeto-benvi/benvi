
import pool from '@/app/lib/dataBase';

export async function up(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS servico (
        id_servico INT AUTO_INCREMENT PRIMARY KEY,
        id_prestador INT NOT NULL,
        id_categoria INT NULL,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT NOT NULL,
        status_servico VARCHAR(50) NOT NULL DEFAULT 'ativo',
        data_inicio DATETIME,
        data_fim DATETIME,
        imagens JSON,
        CONSTRAINT fk_servico_prestador 
          FOREIGN KEY (id_prestador) REFERENCES prestador(id_usuario) 
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_servico_categoria
          FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
          ON DELETE SET NULL ON UPDATE CASCADE
      );
    `;
  await pool.query(sql);    
}