import pool from '@/app/lib/dataBase';
 
export async function up(): Promise<void> {
  const sql = `
      CREATE TABLE IF NOT EXISTS agenda (
        id_agenda       INT AUTO_INCREMENT PRIMARY KEY,
 
        id_prestador    INT NOT NULL,
        id_solicitacao  INT NOT NULL,
 
        horario_inicio  DATETIME NOT NULL,
        horario_fim     DATETIME NOT NULL,
 
        status          VARCHAR(20) NOT NULL DEFAULT 'pendente',
        titulo          VARCHAR(255) NOT NULL,
        descricao       TEXT,
 
        CONSTRAINT fk_agenda_prestador
          FOREIGN KEY (id_prestador)
          REFERENCES prestador(id_usuario)
          ON DELETE CASCADE,
 
        CONSTRAINT fk_agenda_solicitacao
          FOREIGN KEY (id_solicitacao)
          REFERENCES solicitacaoservico(id_solicitacao)
          ON DELETE CASCADE
      );
    `;
  await pool.query(sql);
}