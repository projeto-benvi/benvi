import { Usuario } from './usuario';

export class Prestador extends Usuario {
  // atributos específicos do Prestador
  descricao_profissional?: string;
  status_verificado: boolean;
  status_social: string;
  impulsiona_perfil: boolean;
  categoria_principal?: string;
  is_vulneravel: boolean;
 
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
    is_vulneravel?: boolean;
  }) {
    // 1. Envia os dados do usuário para o construtor da classe Pai (Usuario)
    super(dados); 
    
    // 2. Inicializa os atributos específicos do Prestador
    this.descricao_profissional = dados.descricao_profissional;
    this.status_verificado = dados.status_verificado ?? false;
    this.status_social = dados.status_social ?? 'ativo';
    this.impulsiona_perfil = (dados.is_vulneravel ?? false) ? true : (dados.impulsiona_perfil ?? false);
    this.categoria_principal = dados.categoria_principal;
    this.is_vulneravel = dados.is_vulneravel ?? false;
  }

}