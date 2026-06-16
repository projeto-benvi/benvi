export class ReporteModel {

    id_reporte?: number;
    id_usuario_reportou: number;
    id_usuario_reportado: number;
    id_admin?: number;
    assunto: string;
    arquivo?: string;
    tipo_problema: string;
    descricao: string;
    status: string;
    data_reporte?: Date;

    constructor(dados: {
        id_usuario_reportou: number;
        id_usuario_reportado: number;
        id_admin?: number;
        assunto: string;
        arquivo?: string;
        tipo_problema: string;
        descricao: string;
        status?: string;
        data_reporte?: Date;
    }) {
        this.id_usuario_reportou  = dados.id_usuario_reportou;
        this.id_usuario_reportado = dados.id_usuario_reportado;
        this.id_admin             = dados.id_admin;
        this.assunto              = dados.assunto;
        this.arquivo              = dados.arquivo;
        this.tipo_problema        = dados.tipo_problema;
        this.descricao            = dados.descricao;
        this.status               = dados.status ?? 'pendente';
        this.data_reporte         = dados.data_reporte ?? new Date();
    }

    statusValido(): boolean {
        const permitidos = ['pendente', 'em_analise', 'resolvido', 'arquivado'];
        return permitidos.includes(this.status);
    }

    tipoValido(): boolean {
        const permitidos = [
            'comportamento_inapropriado',
            'fraude',
            'spam',
            'servico_nao_realizado',
            'dados_falsos',
            'outro',
        ];
        return permitidos.includes(this.tipo_problema);
    }
}
