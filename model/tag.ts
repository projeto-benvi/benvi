export class Tag {
  id_tag?: number;
  id_categoria: number;
  id_prestador: number;

  constructor(dados: {
    id_tag?: number;
    id_categoria: number;
    id_prestador: number;
  }) {
    this.id_tag = dados.id_tag;
    this.id_categoria = dados.id_categoria;
    this.id_prestador = dados.id_prestador;
  }

  static getCreateTableSQL(): string {
    return `
    CREATE TABLE IF NOT EXISTS tag (
    id_tag INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT,
    id_prestador INT,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    FOREIGN KEY (id_prestador) REFERENCES prestador(id_usuario)
    );
    `;
}
}