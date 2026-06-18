import pool from '@/app/lib/dataBase';

export async function up(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS notificacao_servico (
      id_notificacao_servico INT AUTO_INCREMENT PRIMARY KEY,
      id_notificacao_fk      INT NULL,
      id_usuario             INT NOT NULL, -- O usuário que receberá/está vinculado à notificação
      descricao              TEXT NOT NULL,
      data_solicitacao       DATETIME DEFAULT CURRENT_TIMESTAMP,
      status_solicitacao     VARCHAR(50) DEFAULT 'Pendente',
      valor_estimado         DECIMAL(10,2) DEFAULT 0.00,

      -- FK para a tabela de notificações gerais (do seu colega)
      CONSTRAINT fk_notif_servico_notificacao
        FOREIGN KEY (id_notificacao_fk)
        REFERENCES notificacao(id_notificacao)
        ON DELETE SET NULL ON UPDATE CASCADE,

      -- Única FK necessária: Vincula direto ao Usuário geral
      CONSTRAINT fk_notif_servico_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
    );
  `;

  await pool.query(sql);
}