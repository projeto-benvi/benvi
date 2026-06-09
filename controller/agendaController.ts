import { Agenda } from "@/model/agenda";
import { AgendaService } from "@/service/agendaService";

export class AgendaController {

    private service = new AgendaService();

    async listar() {
        return await this.service.listar();
    }

    async buscarPorId(id: number) {
        return await this.service.buscarPorId(id);
    }

    async criar(dados: Agenda) {
        return await this.service.criar(dados);
    }

    async atualizar(id: number, dados: Agenda) {
        return await this.service.atualizar(id, dados);
    }

    async remover(id: number) {
        return await this.service.remover(id);
    }
}