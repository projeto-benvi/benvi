import { ParceriaService } from '@/service/parceriaService';

export const ParceriaController = {

    async listar() {
        return await ParceriaService.listar();
    },

    async buscarPorId(id: number) {
        return await ParceriaService.buscarPorId(id);
    },

    async listarPorStatus(status: string) {
        return await ParceriaService.listarPorStatus(status);
    },

    async listarPorEstado(estado: string) {
        return await ParceriaService.listarPorEstado(estado);
    },

    async criar(dados: {
        nome_parceiro: string;
        cidade: string;
        estado: string;
        status?: string;
        data_inicio: Date;
        data_fim?: Date;
    }) {
        return await ParceriaService.criar(dados);
    },

    async atualizar(id: number, dados: Record<string, any>) {
        return await ParceriaService.atualizar(id, dados);
    },

    async remover(id: number) {
        return await ParceriaService.remover(id);
    },
};
