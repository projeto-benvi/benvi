import pool from '@/app/lib/dataBase';

export async function up(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS notificacao (
      id_notificacao INT AUTO_INCREMENT PRIMARY KEY,
      id_usuario INT NOT NULL,
      titulo VARCHAR(255) NOT NULL,
      descricao TEXT NOT NULL,
      visualizada TINYINT(1) DEFAULT 0,
      data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      CONSTRAINT fk_notificacao_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE 
    ) 
  `;
  await pool.query(sql);
}