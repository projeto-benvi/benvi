export class Usuario {
  id_usuario?: number;
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  foto_perfil?: string;
  cpf: string;
  data_nascimento: Date;
  cidade?: string;
  nivel_acesso?: number;
  status_conta?: string;
  data_criacao?: Date;
  is_admin?: boolean;

  constructor(dados: {
    id_usuario?: number; nome: string; email: string; senha: string; telefone?: string; 
    foto_perfil?: string; cpf: string; data_nascimento: Date; cidade?: string; 
    nivel_acesso?: number; status_conta?: string; data_criacao?: Date; is_admin?: boolean;
  }) {
    this.id_usuario = dados.id_usuario;
    this.nome = dados.nome;
    this.email = dados.email;
    this.senha = dados.senha;
    this.telefone = dados.telefone;
    this.foto_perfil = dados.foto_perfil;
    this.cpf = dados.cpf;
    this.data_nascimento = dados.data_nascimento;
    this.cidade = dados.cidade;
    this.nivel_acesso = dados.nivel_acesso ?? 1;
    this.status_conta = dados.status_conta ?? 'ativo';
    this.data_criacao = dados.data_criacao;
    this.is_admin = dados.is_admin ?? false;
  }
 
}