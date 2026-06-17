
export class CidadeAtendida {
  id_cidade?: number;
  id_parceria: number;
  cidade: string;
  estado: string;
  acesso_gratuito: boolean;

    constructor(
      id_parceria: number,
      cidade: string,
      estado: string,
      acesso_gratuito: boolean
    ) {
      this.id_parceria = id_parceria;
      this.cidade = cidade;
      this.estado = estado;
      this.acesso_gratuito = acesso_gratuito;
    }
}