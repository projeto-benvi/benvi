// controller/conversaController.ts
import { ConversaService } from '../service/conversaService';

const conversaService = new ConversaService();

export class ConversaController {
  
  async criarConversa(dados: { idUsuario: string | number; idPrestador: string | number }) {
    if (!dados.idUsuario || !dados.idPrestador) {
      throw new Error('idUsuario e idPrestador são obrigatórios.');
    }

    return await conversaService.buscarOuCriarConversa({
      idUsuario: Number(dados.idUsuario),
      idPrestador: Number(dados.idPrestador)
    });
  }

  async listarConversas(idParticipante: string | number, tipoParticipante: 'usuario' | 'prestador') {
    if (!idParticipante || !tipoParticipante) {
      throw new Error('idParticipante e tipoParticipante são obrigatórios.');
    }

    return await conversaService.listarConversasPorParticipante(Number(idParticipante), tipoParticipante);
  }
}