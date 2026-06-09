import { SolicitacaoServicoService } from '@/service/solicitacaoservicoService';

export const SolicitacaoServicoController = {

    async listar() {
        return await SolicitacaoServicoService.listar();
    },

    async buscarPorId(id: number) {
        return await SolicitacaoServicoService.buscarPorId(id);
    },

    async listarPorUsuario(id_usuario: number) {
        return await SolicitacaoServicoService.listarPorUsuario(id_usuario);
    },

    async listarPorPrestador(id_prestador: number) {
        return await SolicitacaoServicoService.listarPorPrestador(id_prestador);
    },

    async criar(dados: {
        id_usuario: number;
        id_prestador: number;
        id_agenda?: number;
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
