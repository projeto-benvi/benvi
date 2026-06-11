import pool from '@/app/lib/dataBase';
 
export async function up(): Promise<void> {
  const sql = `
      CREATE TABLE IF NOT EXISTS assinaturaplano (
        id_assinatura     INT AUTO_INCREMENT PRIMARY KEY,
 
        id_prestador      INT NOT NULL,
 
        valor_pago        DECIMAL(10, 2) NOT NULL,
 
        data_inicio       DATE NOT NULL,
        data_fim          DATE NOT NULL,
 
        status_pagamento  VARCHAR(20) NOT NULL DEFAULT 'pendente',
        ativo             BOOLEAN NOT NULL DEFAULT true,
 
        CONSTRAINT fk_assinatura_prestador
          FOREIGN KEY (id_prestador)
          REFERENCES prestador(id_usuario)
          ON DELETE CASCADE
      );
    `;
  await pool.query(sql);
}