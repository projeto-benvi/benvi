// controller/mensagemController.ts
import { MensagemService } from '../service/mensagemService';

const mensagemService = new MensagemService();

export class MensagemController {

  async enviarMensagem(dados: { idConversa: string | number; idRemetente: string | number; conteudo: string }) {
    if (!dados.idConversa || !dados.idRemetente || !dados.conteudo) {
      throw new Error('Campos obrigatórios ausentes (idConversa, idRemetente, conteudo).');
    }

    return await mensagemService.enviarMensagem({
      idConversa: Number(dados.idConversa),
      idRemetente: Number(dados.idRemetente),
      conteudo: dados.conteudo
    });
  }

  async listarMensagens(idConversa: string | number) {
    if (!idConversa) {
      throw new Error('O idConversa é obrigatório.');
    }

    return await mensagemService.listarMensagensPorConversa(Number(idConversa));
  }
}