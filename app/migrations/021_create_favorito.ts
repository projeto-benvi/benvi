import pool from '@/app/lib/dataBase';

export async function up(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS favorito (
      id_favorito INT AUTO_INCREMENT PRIMARY KEY,
      id_usuario INT NOT NULL,
      id_prestador INT NOT NULL,
      data_favorito TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT fk_favorito_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,

      CONSTRAINT fk_favorito_prestador
        FOREIGN KEY (id_prestador)
        REFERENCES prestador(id_usuario)
        ON DELETE CASCADE,

      UNIQUE KEY uq_usuario_prestador (id_usuario, id_prestador)
    )
  `;

  await pool.query(sql);
}
