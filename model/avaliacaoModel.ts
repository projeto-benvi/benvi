import pool from '@/app/lib/dataBase';

export class AvaliacaoModel {

  static async criarTabela(): Promise<void> {

    const sql = `
      CREATE TABLE IF NOT EXISTS avaliacao (
        id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,

        id_usuario INT NOT NULL,

        nota DECIMAL(2,1) NOT NULL,
        comentario TEXT,

        data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (id_usuario)
          REFERENCES usuario(id_usuario)
          ON DELETE CASCADE
      );
    `;

    await pool.query(sql);
  }

}

export class Avaliacao {

  constructor(
    public id_usuario: number,
    public nota: number,
    public comentario: string,
    public data_avaliacao: Date = new Date(),
    public id_avaliacao?: number
  ) {}

  validarNota(): boolean {
    return this.nota >= 0 && this.nota <= 5;
  }

  comentarioVazio(): boolean {
    return this.comentario.trim().length === 0;
  }

}

