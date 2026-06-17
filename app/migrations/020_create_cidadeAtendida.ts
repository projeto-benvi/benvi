import pool from "../lib/dataBase";

export async function up(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS cidadeatendida (
      id_cidade INT AUTO_INCREMENT PRIMARY KEY,
      id_parceria INT NOT NULL,
      cidade VARCHAR(150) NOT NULL,
      estado VARCHAR(100) NOT NULL,
      acesso_gratuito TINYINT(1) DEFAULT 0,

      CONSTRAINT fk_cidade_parceria
        FOREIGN KEY (id_parceria)
        REFERENCES parceria(id_parceria) -- Ajuste o nome da tabela se necessário
        ON DELETE CASCADE
    )
  `;
  await pool.query(sql);
}