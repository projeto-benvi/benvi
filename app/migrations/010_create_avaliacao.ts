import pool from '@/app/lib/dataBase';
import { RowDataPacket } from 'mysql2/promise';

export async function up(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS avaliacao (
      id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
      id_usuario INT NOT NULL,
      id_prestador INT NOT NULL,
      id_servico INT NULL,
      nota DECIMAL(2,1) NOT NULL,
      comentario TEXT,
      comunicacao DECIMAL(2,1) NOT NULL DEFAULT 5,
      respeito DECIMAL(2,1) NOT NULL DEFAULT 5,
      pontualidade DECIMAL(2,1) NOT NULL DEFAULT 5,
      acordo DECIMAL(2,1) NOT NULL DEFAULT 5,
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
  `);

  const [columnsServico] = await pool.query<RowDataPacket[]>(
    'SHOW COLUMNS FROM avaliacao LIKE "id_servico"'
  );

  if (columnsServico.length === 0) {
    await pool.query('ALTER TABLE avaliacao ADD COLUMN id_servico INT NULL');
  }

  const subAvaliacaoColumns = ['comunicacao', 'respeito', 'pontualidade', 'acordo'];

  for (const columnName of subAvaliacaoColumns) {
    const [columns] = await pool.query<RowDataPacket[]>(
      `SHOW COLUMNS FROM avaliacao LIKE "${columnName}"`
    );

    if (columns.length === 0) {
      await pool.query(`ALTER TABLE avaliacao ADD COLUMN ${columnName} DECIMAL(2,1) NOT NULL DEFAULT 5`);
    }
  }

  const [foreignKeys] = await pool.query<RowDataPacket[]>(`
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'avaliacao'
      AND CONSTRAINT_NAME = 'fk_avaliacao_servico'
  `);

  if (foreignKeys.length === 0) {
    await pool.query(`
      ALTER TABLE avaliacao
      ADD CONSTRAINT fk_avaliacao_servico
      FOREIGN KEY (id_servico)
      REFERENCES servico(id_servico)
      ON DELETE CASCADE
    `);
  }
}