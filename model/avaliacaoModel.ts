import pool from '@/app/lib/dataBase';

export class AvaliacaoModel {

  constructor(
    public id_usuario: number,
    public id_prestador: number,
    public id_servico: number,
    public nota: number,
    public comentario: string,
    public data_avaliacao: Date = new Date(),
    public id_avaliacao?: number,
    public comunicacao: number = 5,
    public respeito: number = 5,
    public pontualidade: number = 5,
    public acordo: number = 5
  ) {}

  validarNota(): boolean {
    return this.nota >= 0 && this.nota <= 5;
  }    

  comentarioVazio(): boolean {
    return this.comentario.trim().length === 0;
  }
}
