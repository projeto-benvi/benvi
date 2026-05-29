export interface Usuario {
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
}