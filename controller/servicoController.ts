import { servicoService } from '@/service/servicoService';
import { NextRequest, NextResponse } from 'next/server';

export const servicoController = {

  // Lista todos os serviços
  async listar() {
    try {
      const servicos = await servicoService.listarTodos();
      return NextResponse.json(servicos);
    } catch (e) {
      return NextResponse.json(
        { erro: 'Erro ao listar serviços', detalhes: String(e) },
        { status: 500 }
      );
    }
  },

  // Cria um novo serviço
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

  // Busca um serviço pelo ID
  async buscarPorId(id: number) {
    try {
      const servico = await servicoService.buscarPorId(id);
      if (!servico) {
        return NextResponse.json(
          { erro: 'Serviço não encontrado' },
          { status: 404 }
        );
      }
      return NextResponse.json(servico);
    } catch (e) {
      return NextResponse.json(
        { erro: 'Erro ao buscar serviço', detalhes: String(e) },
        { status: 500 }
      );
    }
  },

  // Atualiza um serviço por ID
  async atualizar(id: number, req: NextRequest) {
    try {
      const body = await req.json();
      await servicoService.atualizar(id, body);
      return NextResponse.json({ mensagem: 'Atualizado com sucesso' });
    } catch (e) {
      return NextResponse.json(
        { erro: 'Erro ao atualizar serviço', 
          detalhes: String(e) 
        },
        { status: 500 }
      );
    }
  },

  // Deleta um serviço por ID
  async deletar(id: number) {
    try {
      await servicoService.deletar(id);
      return NextResponse.json({ mensagem: 'Deletado com sucesso' });
    } catch (e: any) {
      return NextResponse.json(
        { 
          erro: 'Erro ao deletar serviço',
          detalhes: e.message || String(e) 
        },
        { status: 500 }
      );
    }
  },
};