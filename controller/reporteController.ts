import { ReporteService } from '@/service/reporteService';

export const ReporteController = {

    async listar() {
        return await ReporteService.listar();
    },

    async buscarPorId(id: number) {
        return await ReporteService.buscarPorId(id);
    },

    async listarPorReportou(id_usuario: number) {
        return await ReporteService.listarPorReportou(id_usuario);
    },

    async listarPorReportado(id_usuario: number) {
        return await ReporteService.listarPorReportado(id_usuario);
    },

    async listarPorStatus(status: string) {
        return await ReporteService.listarPorStatus(status);
    },

    async criar(dados: {
        id_usuario_reportou: number;
        id_usuario_reportado: number;
        assunto: string;
        arquivo?: string;
        tipo_problema: string;
        descricao: string;
    }) {
        return await ReporteService.criar(dados);
    },

    async atualizar(id: number, dados: Record<string, any>) {
        return await ReporteService.atualizar(id, dados);
    },

    async remover(id: number) {
        return await ReporteService.remover(id);
    },
};
