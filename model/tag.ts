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

 
}