import pool from '@/app/lib/dataBase';

export async function up(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS mensagens (
      idMensagem INT AUTO_INCREMENT PRIMARY KEY,
      idConversa INT NOT NULL,
      idRemetente INT NOT NULL,
      conteudo TEXT NOT NULL,
      criadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      CONSTRAINT fk_mensagem_conversa 
        FOREIGN KEY (idConversa) REFERENCES conversas(idConversa) 
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  await pool.query(sql);
}