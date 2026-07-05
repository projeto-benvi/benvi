export type ImagemServico = string | {
  url: string;
  publicId?: string;
};

export class Servico {
  id_servico?: number;
  id_prestador?: number;
  id_categoria?: number;
  titulo?: string;
  descricao?: string;
  status_servico?: string;
  data_inicio?: Date;
  data_fim?: Date;
  imagens?: ImagemServico[];

  constructor(dados: {
    id_servico?: number;
    id_prestador?: number;
    id_categoria?: number;
    titulo: string;
    descricao: string;
    status_servico?: string;
    data_inicio?: Date;
    data_fim?: Date;
    imagens?: ImagemServico[];
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
}
