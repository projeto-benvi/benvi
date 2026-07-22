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

  async listarMensagensDesdeId(idConversa: string | number, afterId: number) {
    if (!idConversa) {
      throw new Error('O idConversa é obrigatório.');
    }
    if (afterId === undefined || afterId === null) {
      throw new Error('O afterId é obrigatório.');
    }

    return await mensagemService.listarMensagensDesdeId(Number(idConversa), afterId);
  }

  async listarUltimasMensagens(
    idConversa: string | number,
    limite = 30
  ) {
    if (!idConversa) {
      throw new Error('O idConversa é obrigatório.');
    }

    return await mensagemService.listarUltimasMensagens(
      Number(idConversa),
      limite
    );
  }

  async listarMensagensAntes(
    idConversa: string | number,
    beforeId: number,
    limite = 30
  ) {
    if (!idConversa) {
      throw new Error('O idConversa é obrigatório.');
    }

    if (beforeId === undefined || beforeId === null) {
      throw new Error('O beforeId é obrigatório.');
    }

    return await mensagemService.listarMensagensAntes(
      Number(idConversa),
      beforeId,
      limite
    );
  }

  async marcarComoLidas(
    idConversa: string | number,
    idUsuario: number
  ) {
    if (!idConversa) {
      throw new Error("O idConversa é obrigatório.");
    }

    await mensagemService.marcarComoLidas(
      Number(idConversa),
      idUsuario
    );
  }
}