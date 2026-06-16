export class ParceriaModel {

    id_parceria?: number;
    nome_parceiro: string;
    cidade: string;
    estado: string;
    status: string;
    data_inicio: Date;
    data_fim?: Date;

    constructor(dados: {
        nome_parceiro: string;
        cidade: string;
        estado: string;
        status?: string;
        data_inicio: Date;
        data_fim?: Date;
    }) {
        this.nome_parceiro = dados.nome_parceiro;
        this.cidade        = dados.cidade;
        this.estado        = dados.estado;
        this.status        = dados.status ?? 'ativo';
        this.data_inicio   = dados.data_inicio;
        this.data_fim      = dados.data_fim;
    }

    statusValido(): boolean {
        const permitidos = ['ativo', 'inativo', 'encerrado', 'suspenso'];
        return permitidos.includes(this.status);
    }

    datasValidas(): boolean {
        if (!this.data_fim) return true;
        return new Date(this.data_inicio) < new Date(this.data_fim);
    }

}
