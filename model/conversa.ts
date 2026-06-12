// model/conversa.ts

export class Conversa {
  idConversa?: number;
  idUsuario: number;      
  idPrestador: number;    
  ultimaMensagemEm: Date;

  constructor(dados: {
    idConversa?: number;
    idUsuario: number;
    idPrestador: number;
    ultimaMensagemEm?: Date;
  }) {
    this.idConversa = dados.idConversa;
    this.idUsuario = dados.idUsuario;
    this.idPrestador = dados.idPrestador;
    this.ultimaMensagemEm = dados.ultimaMensagemEm ?? new Date();
  }

  validar(): string | null {
    if (!this.idUsuario || this.idUsuario <= 0) {
      return 'O ID do usuário informado é inválido.';
    }
    if (!this.idPrestador || this.idPrestador <= 0) {
      return 'O ID do prestador informado é inválido.';
    }
    return null;
  }

  
}