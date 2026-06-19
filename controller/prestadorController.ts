import { prestadorService } from '@/service/prestadorService';
import { NextRequest, NextResponse } from 'next/server';

export const prestadorController = {

  async listar() {
    try {
      const prestadores = await prestadorService.listarTodos();
      return NextResponse.json(prestadores);
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao listar prestadores' }, { status: 500 });
    }
  },

  async listarDestaques() {
    try {
      const destaques = await prestadorService.listarDestaques();
      return NextResponse.json(destaques, { status: 200 });
    } catch (e) {
      console.error('ERRO AO LISTAR DESTAQUES:', e);
      return NextResponse.json({ erro: 'Erro ao listar profissionais de destaque' }, { status: 500 });
    }
  },

  async criar(req: NextRequest) {
    try {
      const body = await req.json();
      const id = await prestadorService.criar(body);
      return NextResponse.json({ id_usuario: id }, { status: 201 });
    } catch (e) {
      console.error('ERRO AO CRIAR PRESTADOR:', e);
      return NextResponse.json({ erro: 'Erro ao criar prestador', detalhes: String(e) }, { status: 500 });
    }
  },

  async buscarPorId(id: number) {
    try {
      const prestador = await prestadorService.buscarPorId(id);
      if (!prestador) {
        return NextResponse.json({ erro: 'Prestador não encontrado' }, { status: 404 });
      }
      return NextResponse.json(prestador);
    } catch (e) {
      console.error('ERRO AO BUSCAR PRESTADOR:', e);
      return NextResponse.json({ erro: 'Erro ao buscar prestador' }, { status: 500 });
    }
  },

 async buscarPorIdUsuario(id_usuario: number) {
    try {
      const prestador = await prestadorService.buscarPorIdUsuario(id_usuario);
      if (!prestador) {
        return NextResponse.json({ erro: 'Prestador não encontrado' }, { status: 404 });
      }
      return NextResponse.json(prestador);
    } catch (e) {
      console.error('ERRO BUSCAR POR ID_USUARIO:', e); // ← já tem, mas vamos ver o output
      return NextResponse.json({ erro: 'Erro ao buscar prestador' }, { status: 500 });
    }
  },

  async atualizar(id: number, req: NextRequest) {
    try {
      const body = await req.json();
      await prestadorService.atualizar(id, body);
      return NextResponse.json({ mensagem: 'Atualizado com sucesso' });
    } catch (e) {
      console.error('ERRO AO ATUALIZAR PRESTADOR:', e);
      return NextResponse.json({ erro: 'Erro ao atualizar prestador' }, { status: 500 });
    }
  },

  async atualizarPorIdUsuario(id_usuario: number, req: NextRequest) {
    try {
      const body = await req.json();
      await prestadorService.atualizarPorIdUsuario(id_usuario, body);
      return NextResponse.json({ mensagem: 'Atualizado com sucesso' });
    } catch (e) {
      console.error('ERRO AO ATUALIZAR PRESTADOR POR ID_USUARIO:', e);
      return NextResponse.json({ erro: 'Erro ao atualizar prestador' }, { status: 500 });
    }
  },

  async deletar(id: number) {
    try {
      await prestadorService.deletar(id);
      return NextResponse.json({ mensagem: 'Deletado com sucesso' });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao deletar prestador' }, { status: 500 });
    }
  }
};