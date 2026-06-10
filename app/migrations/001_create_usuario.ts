// app/migrations/003_create_avaliacao.ts
import pool from '@/app/lib/dataBase';

export async function up(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS usuario (
        id_usuario INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        cpf VARCHAR(14) UNIQUE NOT NULL,
        data_nascimento DATE NOT NULL,
        telefone VARCHAR(20),
        foto_perfil VARCHAR(255),
        cidade VARCHAR(100),
        nivel_acesso INT DEFAULT 1,
        status_conta VARCHAR(50) DEFAULT 'ativo',
        is_admin BOOLEAN DEFAULT FALSE,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
  await pool.query(sql);
}