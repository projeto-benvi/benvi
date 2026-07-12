import { AvaliacaoService } from '@/service/avaliacaoService';

export const AvaliacaoController = {

    async listar() {
        return await AvaliacaoService.listar();
    },

    async buscarPorId(id: number) {
        return await AvaliacaoService.buscarPorId(id);
    },

    async listarPorPrestador(id_prestador: number, p0: { page: number; limit: number; ordem: string; nota: number | null; }) {
    return await AvaliacaoService.listarPorPrestador(id_prestador);
    },

    async criar(
        id_usuario: number,
        id_prestador: number,
        id_servico: number,
        nota: number,
        comentario: string,
        comunicacao: number = 5,
        respeito: number = 5,
        pontualidade: number = 5,
        acordo: number = 5
    ) {

        return await AvaliacaoService.criar(
            id_usuario,
            id_prestador,
            id_servico,
            nota,
            comentario,
            comunicacao,
            respeito,
            pontualidade,
            acordo
        );
    },

    async atualizar(
        id: number,
        nota: number,
        comentario: string
    ) {
        return await AvaliacaoService.atualizar(
            id,
            nota,
            comentario
        );
    },

    async remover(id: number) {

        return await AvaliacaoService.remover(id);

    }

};