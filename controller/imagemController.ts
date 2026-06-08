import { imagemService } from '@/service/imagemService';
import { NextRequest, NextResponse } from 'next/server';

export const imagemController = {

  // LISTAR TODAS AS IMAGENS
  async listar() {
    try {
      const imagens = await imagemService.listarTodas();
      return NextResponse.json(imagens);
    } catch (e) {
      console.error(e);

      return NextResponse.json(
        {erro: "Erro ao listar imagens",
            detalhes: String(e)},
        { status: 500 }
      );
    }
  },

  // CRIAR IMAGEM
  async criar(req: NextRequest) {
    try {
      const body = await req.json();

      const id = await imagemService.criar(body);

      return NextResponse.json(
        { id_imagem: id },
        { status: 201 }
      );
    } catch (e) {
      console.error(e);
      return NextResponse.json(
        { erro: 'Erro ao criar imagem',
          detalhes: String(e) },
        { status: 500 }
      );
    }
  },

  // BUSCAR POR ID
  async buscarPorId(id: number) {
    try {
      const imagem = await imagemService.buscarPorId(id);

      if (!imagem) {
        return NextResponse.json(
          { erro: 'Imagem não encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json(imagem);
    } catch (e) {
      return NextResponse.json(
        { erro: 'Erro ao buscar imagem' },
        { status: 500 }
      );
    }
  },

  // BUSCAR POR SERVIÇO (FK)
  async buscarPorServico(id_servico: number) {
    try {
      const imagens = await imagemService.buscarPorServico(id_servico);
      return NextResponse.json(imagens);
    } catch (e) {
      return NextResponse.json(
        { erro: 'Erro ao buscar imagens do serviço' },
        { status: 500 }
      );
    }
  },

  // ATUALIZAR
  async atualizar(id: number, req: NextRequest) {
    try {
      const body = await req.json();

      await imagemService.atualizar(id, body);

      return NextResponse.json({
        mensagem: 'Imagem atualizada com sucesso'
      });
    } catch (e) {
      return NextResponse.json(
        { erro: 'Erro ao atualizar imagem' },
        { status: 500 }
      );
    }
  },

  // DELETAR
  async deletar(id: number) {
    try {
      await imagemService.deletar(id);

      return NextResponse.json({
        mensagem: 'Imagem deletada com sucesso'
      });
    } catch (e) {
      return NextResponse.json(
        { erro: 'Erro ao deletar imagem' },
        { status: 500 }
      );
    }
  }
};