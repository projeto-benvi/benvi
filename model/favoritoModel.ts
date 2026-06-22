export class FavoritoModel {
  id_favorito?: number;
  id_usuario: number;
  id_prestador: number;
  data_favorito?: Date;

  constructor(dados: {
    id_favorito?: number;
    id_usuario: number;
    id_prestador: number;
    data_favorito?: Date;
  }) {
    this.id_favorito = dados.id_favorito;
    this.id_usuario = dados.id_usuario;
    this.id_prestador = dados.id_prestador;
    this.data_favorito = dados.data_favorito;
  }
}
