
export class Alerta {
  id_alerta?: number;
  id_notificacao: number;
  prioridade: number;
  categoria: string;
  url_acao?: string;
  data_expiracao?: Date | string;

  constructor(dados: {
    id_alerta?: number;
    id_notificacao: number;
    prioridade: number;
    categoria: string;
    url_acao?: string;
    data_expiracao?: Date | string;
  }) {
    this.id_alerta = dados.id_alerta;
    this.id_notificacao = dados.id_notificacao;
    this.prioridade = dados.prioridade;
    this.categoria = dados.categoria;
    this.url_acao = dados.url_acao;
    this.data_expiracao = dados.data_expiracao;
  }
}