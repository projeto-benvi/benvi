
import pool from '@/app/lib/dataBase';

export async function up(): Promise<void> {
  const sql = `
            CREATE TABLE IF NOT EXISTS solicitacaoservico (
                id_solicitacao   INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario       INT NOT NULL,
                id_prestador     INT NOT NULL,
                endereco         VARCHAR(255),
                data_solicitacao DATE,
                data_agendamento DATE,
                status           TINYINT(1) DEFAULT 0,
                descricao_servico TEXT,
                complemento      VARCHAR(255) NOT NULL,

                CONSTRAINT fk_solic_usuario
                    FOREIGN KEY (id_usuario)
                    REFERENCES usuario(id_usuario)
                    ON DELETE CASCADE ON UPDATE CASCADE,

                CONSTRAINT fk_solic_prestador
                    FOREIGN KEY (id_prestador)
                    REFERENCES prestador(id_usuario)
                    ON DELETE CASCADE ON UPDATE CASCADE
            );
        `;
  await pool.query(sql);
}