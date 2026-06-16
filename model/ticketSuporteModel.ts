
export class TicketSuporte {
  id_ticket?: number;
  id_usuario: number;
  titulo: string;
  descricao: string;
  status: string;
  resposta_admin?: string;
  data_abertura?: Date;
  data_encerramento?: Date | string;

  constructor(
    id_usuario: number,
    titulo: string,
    descricao: string,
    status: string,
    resposta_admin?: string,
    data_abertura?: Date,
    data_encerramento?: Date | string
  ) {
    this.id_usuario = id_usuario;
    this.titulo = titulo;
    this.descricao = descricao;
    this.status = status;
    this.resposta_admin = resposta_admin;
    this.data_abertura = data_abertura;
    this.data_encerramento = data_encerramento;
  }

}