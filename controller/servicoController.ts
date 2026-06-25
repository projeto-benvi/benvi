import { servicoService } from '@/service/servicoService';
import { NextRequest, NextResponse } from 'next/server';

export const servicoController = {

  // Lista os serviços de um prestador específico
  async listar(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const idPrestador = searchParams.get('id_prestador');

      if (!idPrestador) {
        return NextResponse.json(
          { erro: 'id_prestador é obrigatório' },
          { status: 400 }
        );
      }

      const servicos = await servicoService.buscarPorPrestador(Number(idPrestador));
      return NextResponse.json(servicos);
    } catch (e) {
      return NextResponse.json(
        { erro: 'Erro ao listar serviços', detalhes: String(e) },
        { status: 500 }
      );
    }
  },

  // criar, buscarPorId, atualizar, deletar continuam exatamente iguais
  async criar(req: NextRequest) {
    try {
      const body = await req.json();
      const id = await servicoService.criar(body);
      return NextResponse.json({ id_servico: id }, { status: 201 });
    } catch (e) {
      return NextResponse.json(
        { erro: 'Erro ao criar serviço', detalhes: String(e) },
        { status: 500 }
      );
    }
  },

  async buscarPorId(id: number) {
    try {
      const servico = await servicoService.buscarPorId(id);
      if (!servico) {
        return NextResponse.json({ erro: 'Serviço não encontrado' }, { status: 404 });
      }
      return NextResponse.json(servico);
    } catch (e) {
      return NextResponse.json(
        { erro: 'Erro ao buscar serviço', detalhes: String(e) },
        { status: 500 }
      );
    }
  },

  async atualizar(id: number, req: NextRequest) {
    try {
      const body = await req.json();
      await servicoService.atualizar(id, body);
      return NextResponse.json({ mensagem: 'Atualizado com sucesso' });
    } catch (e) {
      return NextResponse.json(
        { erro: 'Erro ao atualizar serviço', detalhes: String(e) },
        { status: 500 }
      );
    }
  },

  async deletar(id: number) {
    try {
      await servicoService.deletar(id);
      return NextResponse.json({ mensagem: 'Deletado com sucesso' });
    } catch (e: any) {
      return NextResponse.json(
        { erro: 'Erro ao deletar serviço', detalhes: e.message || String(e) },
        { status: 500 }
      );
    }
  },
};