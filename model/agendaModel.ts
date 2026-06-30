import pool from '@/app/lib/dataBase';

export class AgendaModel {
 
  constructor(
    public id_prestador: number,
    public id_solicitacao: number | null,
    public horario_inicio: Date,
    public horario_fim: Date,
    public status: string,
    public titulo: string,
    public descricao: string,
    public id_agenda?: number
  ) {}
 
  validarHorarios(): boolean {
    return this.horario_inicio < this.horario_fim;
  }
 
  tituloVazio(): boolean {
    return this.titulo.trim().length === 0;
  }
 
  statusValido(): boolean {
    const statusPermitidos = ['pendente', 'confirmado', 'cancelado', 'concluido'];
    return statusPermitidos.includes(this.status);
  }
}