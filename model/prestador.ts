import { Usuario } from './usuario';

export class Prestador extends Usuario {
  // atributos específicos do Prestador
  descricao_profissional?: string;
  status_verificado: boolean;
  status_social: string;
  impulsiona_perfil: boolean;
  categoria_principal?: string;

  constructor(dados: {
    // Dados obrigatórios herdados do Usuário
    id_usuario: number; nome: string; email: string; senha: string; cpf: string; data_nascimento: Date;
    telefone?: string; foto_perfil?: string; cidade?: string; nivel_acesso?: number; status_conta?: string; is_admin?: boolean;
    // Dados específicos do Prestador
    descricao_profissional?: string;
    status_verificado?: boolean;
    status_social?: string;
    impulsiona_perfil?: boolean;
    categoria_principal?: string;
  }) {
    // 1. Envia os dados do usuário para o construtor da classe Pai (Usuario)
    super(dados); 
    
    // 2. Inicializa os atributos específicos do Prestador
    this.descricao_profissional = dados.descricao_profissional;
    this.status_verificado = dados.status_verificado ?? false;
    this.status_social = dados.status_social ?? 'ativo';
    this.impulsiona_perfil = dados.impulsiona_perfil ?? false;
    this.categoria_principal = dados.categoria_principal;
  }

  
  static getCreateTableSQL(): string {
    return `
      CREATE TABLE IF NOT EXISTS prestador (
        id_usuario INT PRIMARY KEY,
        descricao_profissional TEXT,
        status_verificado BOOLEAN DEFAULT FALSE,
        status_social VARCHAR(50) DEFAULT 'ativo',
        impulsiona_perfil BOOLEAN DEFAULT FALSE,
        categoria_principal VARCHAR(100),
        CONSTRAINT fk_prestador_usuario 
          FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) 
          ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
  }
}