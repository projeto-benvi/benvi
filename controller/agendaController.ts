import { AgendaService } from '@/service/agendaService';
 
export const AgendaController = {
 
    async listar() {
        return await AgendaService.listar();
    },
 
    async buscarPorId(id: number) {
        return await AgendaService.buscarPorId(id);
    },
 
    async listarPorPrestador(id_prestador: number) {
        return await AgendaService.listarPorPrestador(id_prestador);
    },
 
    async listarPorSolicitacao(id_solicitacao: number) {
        return await AgendaService.listarPorSolicitacao(id_solicitacao);
    },
 
    async criar(dados: {
        id_prestador: number;
        id_solicitacao?: number | null;
        horario_inicio: Date;
        horario_fim: Date;
        status?: string;
        titulo: string;
        descricao?: string;
    }) {
        return await AgendaService.criar(dados);
    },
 
    async atualizar(id: number, dados: Record<string, any>) {
        return await AgendaService.atualizar(id, dados);
    },
 
    async remover(id: number) {
        return await AgendaService.remover(id);
    },
};