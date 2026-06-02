import { AvaliacaoModel } from '@/model/avaliacaoModel';

export const AvaliacaoService = {

  async listar() {
    return await AvaliacaoModel.getAll();
  },

  async buscarPorId(id: number) {

    const avaliacoes = await AvaliacaoModel.getAll();
    const avaliacao = avaliacoes.find(
      (item) => item.id_avaliacao === id
    );

    if (!avaliacao) {
      throw new Error('Avaliação não encontrada');
    }

    return avaliacao;
  },

  async criar(
    nota: number,
    comentario: string
  ) {

    if (nota < 0 || nota > 5) {
      throw new Error('A nota deve estar entre 0 e 5');
    }

    return await AvaliacaoModel.create(
      nota,
      comentario,
      new Date()
    );
  },

  async atualizar(
    id: number,
    nota: number,
    comentario: string
  ) {

    if (nota < 0 || nota > 5) {
      throw new Error('A nota deve estar entre 0 e 5');
    }

    const atualizado = await (AvaliacaoModel as any).update(
      id,
      nota,
      comentario
    );

    if (!atualizado) {
      throw new Error('Avaliação não encontrada');
    }

    return atualizado;
  },

  async remover(id: number) {

    const removido = await AvaliacaoModel.delete(id);

    if (!removido) {
      throw new Error('Avaliação não encontrada');
    }

    return removido;
  }
};