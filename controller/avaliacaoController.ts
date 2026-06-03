import { AvaliacaoService } from '@/service/avaliacaoService';

export const AvaliacaoController = {

    async listar() {
        return await AvaliacaoService.listar();
    },

    async buscarPorId(id: number) {
        return await AvaliacaoService.buscarPorId(id);
    },


    async criar(
        id_usuario: number,
        nota: number,
        comentario: string
    ) {

        return await AvaliacaoService.criar(
            id_usuario,
            nota,
            comentario
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