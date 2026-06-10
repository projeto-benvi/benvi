

export class Servico {
  id_servico?: number;
  id_prestador?: number;
  id_categoria?: number;
  titulo?: string;
  descricao?: string;
  status_servico?: string;
  data_inicio?: Date;
  data_fim?: Date;
  imagens?: string[];

  constructor(dados: {
    id_servico?: number;
    id_prestador?: number;
    id_categoria?: number;
    titulo: string;
    descricao: string;
    status_servico?: string;
    data_inicio?: Date;
    data_fim?: Date;
    imagens?: string[];
  }) {
    this.id_servico = dados.id_servico;
    this.id_prestador = dados.id_prestador;
    this.id_categoria = dados.id_categoria;
    this.titulo = dados.titulo;
    this.descricao = dados.descricao;
    this.status_servico = dados.status_servico ?? 'ativo';
    this.data_inicio = dados.data_inicio;
    this.data_fim = dados.data_fim;
    this.imagens = dados.imagens ?? [];
  }
  static createTableQuery(): string {
        return `
          CREATE TABLE IF NOT EXISTS servico (
            id_servico INT AUTO_INCREMENT PRIMARY KEY,
            id_prestador INT NOT NULL,
            id_categoria INT NOT NULL,
            titulo VARCHAR(255) NOT NULL,
            descricao TEXT NOT NULL,
            status_servico VARCHAR(50) NOT NULL DEFAULT 'ativo',
            data_inicio DATETIME,
            data_fim DATETIME,
            imagens JSON,
            CONSTRAINT fk_servico_prestador 
              FOREIGN KEY (id_prestador) REFERENCES prestador(id_usuario) 
              ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
  }
}