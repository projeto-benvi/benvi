export class Prestador {
  id_prestador?: number;
  id_usuario: number;
  descricao_profissional?: string;
  status_verificado?: boolean;
  status_social?: string;
  impulsiona_perfil?: boolean;
  categoria_principal?: string;

  constructor(dados: {
    id_prestador?: number;
    id_usuario: number;
    descricao_profissional?: string;
    status_verificado?: boolean;
    status_social?: string;
    impulsiona_perfil?: boolean;
    categoria_principal?: string;
  }) {
    this.id_prestador = dados.id_prestador;
    this.id_usuario = dados.id_usuario;
    this.descricao_profissional = dados.descricao_profissional;
    this.status_verificado = dados.status_verificado ?? false;
    this.status_social = dados.status_social ?? 'ativo';
    this.impulsiona_perfil = dados.impulsiona_perfil ?? false;
    this.categoria_principal = dados.categoria_principal;
  }
}