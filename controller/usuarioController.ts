import { usuarioService } from '@/service/usuarioService';
import { NextRequest, NextResponse } from 'next/server';

export const usuarioController = {

  async listar() {
    try {
      const usuarios = await usuarioService.listarTodos();
      return NextResponse.json(usuarios);
    } catch (e) {
      return NextResponse.json(
        { erro: 'Erro ao listar usuários' },
        { status: 500 }
      );
    }
  },

  async criar(req: NextRequest) {
    try {
      const body = await req.json();
      const id = await usuarioService.criar(body);
      return NextResponse.json({ id_usuario: id }, { status: 201 });
    } catch (e) {
      console.error('ERRO DETALHADO:', e); 
      return NextResponse.json(
        { erro: 'Erro ao criar usuário' },
        { status: 500 }
      );
    }
  },

  async buscarPorId(id: number) {
    try {
      const usuario = await usuarioService.buscarPorId(id);
      if (!usuario) {
        return NextResponse.json(
          { erro: 'Usuário não encontrado' },
          { status: 404 }
        );
      }
      return NextResponse.json(usuario);
    } catch (e) {
      return NextResponse.json(
        { erro: 'Erro ao buscar usuário' },
        { status: 500 }
      );
    }
  },

  async atualizar(id: number, req: NextRequest) {
    try {
      const body = await req.json();
      await usuarioService.atualizar(id, body);
      return NextResponse.json({ mensagem: 'Atualizado com sucesso' });
    } catch (e) {
      return NextResponse.json(
        { erro: 'Erro ao atualizar usuário' },
        { status: 500 }
      );
    }
  },

  async deletar(id: number) {
    try {
      await usuarioService.deletar(id);
      return NextResponse.json({ mensagem: 'Deletado com sucesso' });
    } catch (e) {
      return NextResponse.json(
        { erro: 'Erro ao deletar usuário' },
        { status: 500 }
      );
    }
  }
};