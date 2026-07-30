import pool from '@/app/lib/dataBase';

async function columnExists(columnName: string) {
  const [rows]: any = await pool.query(
    `SELECT 1
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'mensagens'
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [columnName]
  );
  return rows.length > 0;
}

async function addColumnIfMissing(columnName: string, definition: string) {
  if (await columnExists(columnName)) return;
  await pool.query(`ALTER TABLE mensagens ADD COLUMN ${columnName} ${definition}`);
}

export async function up(): Promise<void> {
  await addColumnIfMissing('tipo_mensagem', "VARCHAR(20) NOT NULL DEFAULT 'texto'");
  await addColumnIfMissing('arquivo_url', 'VARCHAR(500) NULL');
  await addColumnIfMissing('arquivo_public_id', 'VARCHAR(255) NULL');
  await addColumnIfMissing('arquivo_mime', 'VARCHAR(100) NULL');
  await addColumnIfMissing('arquivo_tamanho', 'INT UNSIGNED NULL');
  await addColumnIfMissing('audio_duracao', 'DECIMAL(8,2) UNSIGNED NULL');
}
