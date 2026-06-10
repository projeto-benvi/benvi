export class AssinaturaPlanoModel {
 
  constructor(
    public id_prestador: number,
    public valor_pago: number,
    public data_inicio: Date,
    public data_fim: Date,
    public status_pagamento: string,
    public ativo: boolean,
    public id_assinatura?: number
  ) {}
 
  validarDatas(): boolean {
    return new Date(this.data_inicio) < new Date(this.data_fim);
  }
 
  valorValido(): boolean {
    return this.valor_pago > 0;
  }
 
  statusValido(): boolean {
    const statusPermitidos = ['pendente', 'pago', 'cancelado', 'expirado'];
    return statusPermitidos.includes(this.status_pagamento);
  }
}