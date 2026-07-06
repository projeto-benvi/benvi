import pool from '@/app/lib/dataBase';

async function columnExists(tableName: string, columnName: string) {
  const [rows]: any = await pool.query(
    `SELECT 1
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [tableName, columnName]
  );

  return rows.length > 0;
}

async function indexExists(tableName: string, indexName: string) {
  const [rows]: any = await pool.query(
    `SELECT 1
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND INDEX_NAME = ?
     LIMIT 1`,
    [tableName, indexName]
  );

  return rows.length > 0;
}

async function addColumnIfMissing(tableName: string, columnName: string, definition: string) {
  if (await columnExists(tableName, columnName)) return;
  await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}

async function addIndexIfMissing(tableName: string, indexName: string, columns: string) {
  if (await indexExists(tableName, indexName)) return;
  await pool.query(`CREATE INDEX ${indexName} ON ${tableName} (${columns})`);
}

export async function up(): Promise<void> {
  await addColumnIfMissing('servico', 'tempo_execucao', 'VARCHAR(100) NULL');
  await addColumnIfMissing('notificacao', 'url_acao', 'VARCHAR(255) NULL');
  await addColumnIfMissing('notificacao', 'tipo', 'VARCHAR(80) NULL');
  await addColumnIfMissing('mensagens', 'lida', 'TINYINT(1) DEFAULT 0');
  await addColumnIfMissing('alerta', 'status', "VARCHAR(40) NOT NULL DEFAULT 'ativo'");
  await addColumnIfMissing('alerta', 'data_criacao', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
  await addColumnIfMissing('alerta', 'data_resolucao', 'DATETIME NULL');
  await addColumnIfMissing('ticketsuporte', 'id_prestador', 'INT NULL');
  await addColumnIfMissing('ticketsuporte', 'id_servico', 'INT NULL');
  await addColumnIfMissing('ticketsuporte', 'categoria', "VARCHAR(100) NOT NULL DEFAULT 'geral'");
  await addColumnIfMissing('ticketsuporte', 'prioridade', "VARCHAR(30) NOT NULL DEFAULT 'media'");
  await addColumnIfMissing('ticketsuporte', 'data_atualizacao', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  await pool.query('ALTER TABLE servico MODIFY id_categoria INT NULL').catch(() => null);
  await pool.query('ALTER TABLE agenda MODIFY id_solicitacao INT NULL').catch(() => null);

  await addIndexIfMissing('usuario', 'idx_usuario_email_status', 'email, status_conta');
  await addIndexIfMissing('usuario', 'idx_usuario_cidade', 'cidade');
  await addIndexIfMissing('prestador', 'idx_prestador_categoria', 'categoria_principal');
  await addIndexIfMissing('categoria', 'idx_categoria_nome', 'nome_categoria');
  await addIndexIfMissing('tag', 'idx_tag_categoria_prestador', 'id_categoria, id_prestador');
  await addIndexIfMissing('servico', 'idx_servico_prestador_status', 'id_prestador, status_servico');
  await addIndexIfMissing('servico', 'idx_servico_categoria', 'id_categoria');
  await addIndexIfMissing('solicitacaoservico', 'idx_solicitacao_usuario_data', 'id_usuario, data_solicitacao');
  await addIndexIfMissing('solicitacaoservico', 'idx_solicitacao_prestador_data', 'id_prestador, data_solicitacao');
  await addIndexIfMissing('conversas', 'idx_conversas_usuario_prestador', 'idUsuario, idPrestador');
  await addIndexIfMissing('mensagens', 'idx_mensagens_conversa_criado', 'idConversa, criadoEm');
  await addIndexIfMissing('notificacao', 'idx_notificacao_usuario_visualizada', 'id_usuario, visualizada, data_envio');
  await addIndexIfMissing('avaliacao', 'idx_avaliacao_prestador_data', 'id_prestador, data_avaliacao');
  await addIndexIfMissing('ticketsuporte', 'idx_ticket_usuario_status', 'id_usuario, status');
}
