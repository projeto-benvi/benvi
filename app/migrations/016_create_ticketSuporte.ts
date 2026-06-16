import pool from "@/app/lib/dataBase";

export async function up(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS ticketsuporte (
      id_ticket INT AUTO_INCREMENT PRIMARY KEY,
      id_usuario INT NOT NULL,
      titulo VARCHAR(255) NOT NULL,
      descricao TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Aberto',
      resposta_admin TEXT NULL,
      data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_encerramento DATETIME NULL,

      CONSTRAINT fk_ticket_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
    )
  `;
  await pool.query(sql);
}