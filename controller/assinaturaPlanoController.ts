import { AssinaturaPlanoService } from '@/service/assinaturaPlanoService';

export const AssinaturaPlanoController = {

    async listar() {
        return await AssinaturaPlanoService.listar();
    },

    async buscarPorId(id: number) {
        return await AssinaturaPlanoService.buscarPorId(id);
    },

    async listarPorPrestador(id_prestador: number) {
        return await AssinaturaPlanoService.listarPorPrestador(id_prestador);
    },

    async buscarAtivaByPrestador(id_prestador: number) {
        return await AssinaturaPlanoService.buscarAtivaByPrestador(id_prestador);
    },

    async criar(dados: {
        id_prestador: number;
        valor_pago: number;
        data_inicio: Date;
        data_fim: Date;
        status_pagamento?: string;
        ativo?: boolean;
    }) {
        return await AssinaturaPlanoService.criar(dados);
    },

    async atualizar(id: number, dados: Record<string, any>) {
        return await AssinaturaPlanoService.atualizar(id, dados);
    },

    async remover(id: number) {
        return await AssinaturaPlanoService.remover(id);
    },
};