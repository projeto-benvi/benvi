export interface Avaliacao {
  id_avaliacao?: number;
  id_usuario?: number;
  id_prestador?: number;
  id_solicitacao?: number;
  nota: number;
  comentario: string;
  data_avaliacao?: Date;
}