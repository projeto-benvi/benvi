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

  static getCreateTableSQL(): string {
    return `
      CREATE TABLE IF NOT EXISTS conversas (
        idConversa INT AUTO_INCREMENT PRIMARY KEY,
        idUsuario INT NOT NULL,
        idPrestador INT NOT NULL,
        ultimaMensagemEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        UNIQUE KEY uq_usuario_prestador (idUsuario, idPrestador),
        
        CONSTRAINT fk_conversa_usuario 
          FOREIGN KEY (idUsuario) REFERENCES usuario(id_usuario) 
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_conversa_prestador 
          FOREIGN KEY (idPrestador) REFERENCES prestador(id_usuario) 
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
  }
}