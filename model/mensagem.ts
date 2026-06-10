// model/mensagem.ts

export class Mensagem {
  idMensagem?: number;
  idConversa: number;    
  idRemetente: number;   
  conteudo: string;
  criadoEm: Date;

  constructor(dados: {
    idMensagem?: number;
    idConversa: number;
    idRemetente: number;
    conteudo: string;
    criadoEm?: Date;
  }) {
    this.idMensagem = dados.idMensagem;
    this.idConversa = dados.idConversa;
    this.idRemetente = dados.idRemetente;
    this.conteudo = dados.conteudo;
    this.criadoEm = dados.criadoEm ?? new Date();
  }

  validar(): string | null {
    if (!this.idConversa || this.idConversa <= 0) {
      return 'A mensagem precisa estar vinculada a uma conversa válida.';
    }
    if (!this.idRemetente || this.idRemetente <= 0) {
      return 'O ID do remetente informado é inválido.';
    }
    if (!this.conteudo || this.conteudo.trim().length === 0) {
      return 'O conteúdo da mensagem não pode estar vazio.';
    }
    return null;
  }

  static getCreateTableSQL(): string {
    return `
      CREATE TABLE IF NOT EXISTS mensagens (
        idMensagem INT AUTO_INCREMENT PRIMARY KEY,
        idConversa INT NOT NULL,
        idRemetente INT NOT NULL,
        conteudo TEXT NOT NULL,
        criadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_mensagem_conversa 
          FOREIGN KEY (idConversa) REFERENCES conversas(idConversa) 
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
  }
}