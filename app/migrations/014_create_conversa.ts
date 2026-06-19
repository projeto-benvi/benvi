import pool from '@/app/lib/dataBase';

export async function up(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS conversas (
      idConversa INT AUTO_INCREMENT PRIMARY KEY,
      idUsuario INT NOT NULL,
      idPrestador INT NOT NULL,
      ultimaMensagemEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      UNIQUE KEY uq_usuario_prestador (idUsuario, idPrestador),
      
      CONSTRAINT fk_conversa_usuario 
        FOREIGN KEY (idUsuario) REFERENCES usuario(id_usuario) 
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_conversa_prestador 
        FOREIGN KEY (idPrestador) REFERENCES prestador(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  await pool.query(sql);
}