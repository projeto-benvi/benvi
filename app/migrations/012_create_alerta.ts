import pool from '@/app/lib/dataBase';

export async function up(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS alerta (
      id_alerta INT AUTO_INCREMENT PRIMARY KEY,
      id_notificacao INT NOT NULL,
      prioridade INT NOT NULL DEFAULT 1,
      categoria VARCHAR(100) NOT NULL,
      url_acao VARCHAR(255) NULL,
      data_expiracao DATETIME NULL,

      CONSTRAINT fk_alerta_notificacao
        FOREIGN KEY (id_notificacao)
        REFERENCES notificacao(id_notificacao)
        ON DELETE CASCADE
    )
  `;
  await pool.query(sql);
}
