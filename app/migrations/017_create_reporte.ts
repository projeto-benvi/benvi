import pool from '@/app/lib/dataBase';

export async function up(): Promise<void> {
  const sql = `
            CREATE TABLE IF NOT EXISTS reporte (
                id_reporte           INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario_reportou  INT NOT NULL,
                id_usuario_reportado INT NOT NULL,
                id_admin             INT,
                assunto              VARCHAR(255) NOT NULL,
                arquivo              VARCHAR(255),
                tipo_problema        VARCHAR(100) NOT NULL,
                descricao            TEXT NOT NULL,
                status               VARCHAR(50) DEFAULT 'pendente',
                data_reporte         DATETIME DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT fk_reporte_reportou
                    FOREIGN KEY (id_usuario_reportou)
                    REFERENCES usuario(id_usuario)
                    ON DELETE CASCADE ON UPDATE CASCADE,

                CONSTRAINT fk_reporte_reportado
                    FOREIGN KEY (id_usuario_reportado)
                    REFERENCES usuario(id_usuario)
                    ON DELETE CASCADE ON UPDATE CASCADE,

                CONSTRAINT fk_reporte_admin
                    FOREIGN KEY (id_admin)
                    REFERENCES usuario(id_usuario)
                    ON DELETE SET NULL ON UPDATE CASCADE
            );
        `;
  await pool.query(sql);
}