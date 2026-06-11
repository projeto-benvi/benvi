export class Categoria {
  id_categoria?: number;
  nome_categoria: string;
  descricao?: string;
  status?: string;
  data_criacao?: Date;

  constructor(dados: {
    id_categoria?: number;
    nome_categoria: string;
    descricao?: string;
  }) {
    this.id_categoria = dados.id_categoria;
    this.nome_categoria = dados.nome_categoria;
    this.descricao = dados.descricao;
  }

}
