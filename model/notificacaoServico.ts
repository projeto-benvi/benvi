export class NotificacaoServico {
  id_notificacao_servico?: number;
  id_notificacao_fk: number | null;
  id_usuario: number;
  descricao: string;
  data_solicitacao?: Date;
  status_solicitacao?: string;
  valor_estimado?: number;

  constructor(dados: {
    id_notificacao_servico?: number;
    id_notificacao_fk: number | null;
    id_usuario: number;
    descricao: string;
    data_solicitacao?: Date;
    status_solicitacao?: string;
    valor_estimado?: number;
  }) {
    this.id_notificacao_servico = dados.id_notificacao_servico;
    this.id_notificacao_fk = dados.id_notificacao_fk;
    this.id_usuario = dados.id_usuario;
    this.descricao = dados.descricao;
    this.data_solicitacao = dados.data_solicitacao ?? new Date();
    this.status_solicitacao = dados.status_solicitacao ?? 'Pendente';
    this.valor_estimado = dados.valor_estimado ?? 0;
  }
}