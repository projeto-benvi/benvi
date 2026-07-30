import { SolicitacaoServicoService } from '@/service/solicitacaoservicoService';
import { ParametrosPaginacao } from '@/app/lib/paginacao';

export const SolicitacaoServicoController = {

    async listar(paginacao: ParametrosPaginacao) {
        return await SolicitacaoServicoService.listar(paginacao);
    },

    async buscarPorId(id: number) {
        return await SolicitacaoServicoService.buscarPorId(id);
    },

    async listarPorUsuario(id_usuario: number, paginacao: ParametrosPaginacao) {
        return await SolicitacaoServicoService.listarPorUsuario(id_usuario, paginacao);
    },

    async listarPorPrestador(id_prestador: number, paginacao: ParametrosPaginacao) {
        return await SolicitacaoServicoService.listarPorPrestador(id_prestador, paginacao);
    },

    async criar(dados: {
        id_usuario: number;
        id_prestador: number;
        endereco?: string;
        data_agendamento?: Date;
        descricao_servico?: string;
        complemento: string;
    }) {
        return await SolicitacaoServicoService.criar(dados);
    },

    async atualizar(id: number, dados: Record<string, any>) {
        return await SolicitacaoServicoService.atualizar(id, dados);
    },

    async remover(id: number) {
        return await SolicitacaoServicoService.remover(id);
    },
};
