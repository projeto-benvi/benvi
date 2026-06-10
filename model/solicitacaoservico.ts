export class SolicitacaoServico {
    id_solicitacao?: number;
    id_usuario: number;
    id_prestador: number;
    endereco?: string;
    data_solicitacao?: Date;
    data_agendamento?: Date;
    status: boolean;
    descricao_servico?: string;
    complemento: string;
 
    constructor(dados: {
        id_usuario: number;
        id_prestador: number;
        endereco?: string;
        data_solicitacao?: Date;
        data_agendamento?: Date;
        status?: boolean;
        descricao_servico?: string;
        complemento: string;
    }) {
        this.id_usuario        = dados.id_usuario;
        this.id_prestador      = dados.id_prestador;
        this.endereco          = dados.endereco;
        this.data_solicitacao  = dados.data_solicitacao ?? new Date();
        this.data_agendamento  = dados.data_agendamento;
        this.status            = dados.status ?? false; // false = pendente
        this.descricao_servico = dados.descricao_servico;
        this.complemento       = dados.complemento;
    }
}
