export class Prestador {
  constructor(
    public id_usuario: number,
    public descricao_profissional?: string,
    public status_verificado: boolean = false,
    public status_social: string = 'ativo',
    public impulsiona_perfil: boolean = false,
    public categoria_principal?: string,
  ) {}
}