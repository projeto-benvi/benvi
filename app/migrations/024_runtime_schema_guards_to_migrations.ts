import pool from '@/app/lib/dataBase';
import { RowDataPacket } from 'mysql2/promise';

async function columnExists(table: string, column: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows.length > 0;
}

async function indexExists(table: string, indexName: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT INDEX_NAME
       FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?`,
    [table, indexName]
  );
  return rows.length > 0;
}

async function addColumnIfMissing(table: string, column: string, definition: string) {
  if (!(await columnExists(table, column))) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function addIndexIfMissing(table: string, indexName: string, columns: string) {
  if (!(await indexExists(table, indexName))) {
    await pool.query(`CREATE INDEX ${indexName} ON ${table} (${columns})`);
  }
}

export async function up(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ticketsuporte_interacao (
      id_interacao INT AUTO_INCREMENT PRIMARY KEY,
      id_ticket INT NOT NULL,
      id_usuario INT NOT NULL,
      mensagem TEXT NOT NULL,
      tipo VARCHAR(30) NOT NULL DEFAULT 'usuario',
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_ticket_interacao_ticket
        FOREIGN KEY (id_ticket)
        REFERENCES ticketsuporte(id_ticket)
        ON DELETE CASCADE,
      CONSTRAINT fk_ticket_interacao_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
    )
  `);

  await addColumnIfMissing('avaliacao', 'id_servico', 'INT NULL');
  await addColumnIfMissing('avaliacao', 'comunicacao', 'DECIMAL(2,1) NOT NULL DEFAULT 5');
  await addColumnIfMissing('avaliacao', 'respeito', 'DECIMAL(2,1) NOT NULL DEFAULT 5');
  await addColumnIfMissing('avaliacao', 'pontualidade', 'DECIMAL(2,1) NOT NULL DEFAULT 5');
  await addColumnIfMissing('avaliacao', 'acordo', 'DECIMAL(2,1) NOT NULL DEFAULT 5');

  await addColumnIfMissing('alerta', 'status', "VARCHAR(40) NOT NULL DEFAULT 'ativo'");
  await addColumnIfMissing('alerta', 'data_criacao', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
  await addColumnIfMissing('alerta', 'data_resolucao', 'DATETIME NULL');

  await addColumnIfMissing('ticketsuporte', 'id_prestador', 'INT NULL');
  await addColumnIfMissing('ticketsuporte', 'id_servico', 'INT NULL');
  await addColumnIfMissing('ticketsuporte', 'categoria', "VARCHAR(100) NOT NULL DEFAULT 'geral'");
  await addColumnIfMissing('ticketsuporte', 'prioridade', "VARCHAR(30) NOT NULL DEFAULT 'media'");
  await addColumnIfMissing('ticketsuporte', 'data_atualizacao', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  await pool.query('ALTER TABLE agenda MODIFY id_solicitacao INT NULL').catch(() => null);

  await addIndexIfMissing('ticketsuporte_interacao', 'idx_ticket_interacao_ticket_criacao', 'id_ticket, data_criacao');
}
