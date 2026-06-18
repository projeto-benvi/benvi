// app/migrations/005_create_tag.ts
import pool from '@/app/lib/dataBase';

export async function up(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS tag (
      id_tag INT AUTO_INCREMENT PRIMARY KEY,
      id_prestador INT NOT NULL,
      id_categoria INT NOT NULL,
      data_vinculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      -- Vincula com a tabela prestador (que usa id_usuario como chave primária)
      CONSTRAINT fk_tag_prestador FOREIGN KEY (id_prestador) 
        REFERENCES prestador(id_usuario) ON DELETE CASCADE,
        
      -- Vincula com a tabela categoria
      CONSTRAINT fk_tag_categoria FOREIGN KEY (id_categoria) 
        REFERENCES categoria(id_categoria) ON DELETE CASCADE,
        
      -- Impede que o mesmo prestador seja cadastrado duas vezes na mesma categoria
      UNIQUE KEY uq_prestador_categoria (id_prestador, id_categoria)
    );
  `;
  await pool.query(sql);
}