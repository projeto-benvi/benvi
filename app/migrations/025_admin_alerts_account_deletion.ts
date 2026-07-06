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
  await addColumnIfMissing('usuario', 'deleted_at', 'DATETIME NULL');
  await addColumnIfMissing('usuario', 'deleted_by_user', 'BOOLEAN NOT NULL DEFAULT FALSE');
  await addColumnIfMissing('usuario', 'motivo_exclusao', 'VARCHAR(255) NULL');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_auditoria (
      id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
      id_admin INT NOT NULL,
      id_usuario_afetado INT NULL,
      acao VARCHAR(100) NOT NULL,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_admin_auditoria_admin
        FOREIGN KEY (id_admin)
        REFERENCES usuario(id_usuario)
        ON DELETE RESTRICT,
      CONSTRAINT fk_admin_auditoria_usuario_afetado
        FOREIGN KEY (id_usuario_afetado)
        REFERENCES usuario(id_usuario)
        ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS alerta_envio (
      id_alerta_envio INT AUTO_INCREMENT PRIMARY KEY,
      id_admin INT NOT NULL,
      titulo VARCHAR(160) NOT NULL,
      mensagem TEXT NOT NULL,
      tipo VARCHAR(30) NOT NULL,
      publico_alvo VARCHAR(40) NOT NULL,
      url_acao VARCHAR(255) NULL,
      total_destinatarios INT NOT NULL DEFAULT 0,
      data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_alerta_envio_admin
        FOREIGN KEY (id_admin)
        REFERENCES usuario(id_usuario)
        ON DELETE RESTRICT
    )
  `);

  await addColumnIfMissing('notificacao', 'id_alerta_envio', 'INT NULL');
  await addIndexIfMissing('usuario', 'idx_usuario_status_deleted', 'status_conta, deleted_at');
  await addIndexIfMissing('prestador', 'idx_prestador_status_social', 'status_social');
  await addIndexIfMissing('admin_auditoria', 'idx_admin_auditoria_usuario_data', 'id_usuario_afetado, data_criacao');
  await addIndexIfMissing('alerta_envio', 'idx_alerta_envio_admin_data', 'id_admin, data_envio');
  await addIndexIfMissing('notificacao', 'idx_notificacao_alerta_envio', 'id_alerta_envio');
}
