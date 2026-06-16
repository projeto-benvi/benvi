
export class Notificacao {
  id_notificacao?: number;
  id_usuario: number;
  titulo: string;
  descricao: string;
  visualizada: boolean;
  data_envio?: Date;

  constructor(dados: {
    id_notificacao?: number;
    id_usuario: number;
    titulo: string;
    descricao: string;
    visualizada: boolean;
    data_envio?: Date;
  }) {
    this.id_notificacao = dados.id_notificacao;
    this.id_usuario = dados.id_usuario;
    this.titulo = dados.titulo;
    this.descricao = dados.descricao;
    this.visualizada = dados.visualizada;
    this.data_envio = dados.data_envio ?? new Date();
  }
}
