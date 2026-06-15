import { notificacaoService } from '@/service/notificacaoService';
import { NextResponse, NextRequest } from 'next/server';

export const notificacaoController = {
  async criar(req: NextRequest) {
    try {
      const body = await req.json();
      const { id_usuario, titulo, descricao } = body;

      if (!id_usuario || !titulo || !descricao) {
        return NextResponse.json({ erro: 'Campos obrigatórios ausentes' }, { status: 400 });
      }

      const novaNotificacao = await notificacaoService.criar({ id_usuario, titulo, descricao });
      return NextResponse.json(novaNotificacao, { status: 201 });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao criar notificação', detalhes: String(e) }, { status: 500 });
    }
  },

  async listarPorUsuario(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const idUsuario = searchParams.get('id_usuario');

      if (!idUsuario) {
        return NextResponse.json({ erro: 'O parâmetro id_usuario é obrigatório' }, { status: 400 });
      }

      const notificacoes = await notificacaoService.listarPorUsuario(Number(idUsuario));
      return NextResponse.json(notificacoes);
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao listar notificações', detalhes: String(e) }, { status: 500 });
    }
  },

  async buscarPorId(id: number) {
    try {
      const notificacao = await notificacaoService.buscarPorId(id);
      if (!notificacao) {
        return NextResponse.json({ erro: 'Notificação não encontrada' }, { status: 404 });
      }
      return NextResponse.json(notificacao);
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao buscar notificação', detalhes: String(e) }, { status: 500 });
    }
  },

  async marcarComoVisualizada(id: number) {
    try {
      const atualizado = await notificacaoService.marcarComoVisualizada(id);
      if (!atualizado) {
        return NextResponse.json({ erro: 'Notificação não encontrada para atualizar' }, { status: 404 });
      }
      return NextResponse.json({ mensagem: 'Notificação marcada como visualizada' });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao atualizar notificação', detalhes: String(e) }, { status: 500 });
    }
  },

  async deletar(id: number) {
    try {
      const deletado = await notificacaoService.deletar(id);
      if (!deletado) {
        return NextResponse.json({ erro: 'Notificação não encontrada para exclusão' }, { status: 404 });
      }
      return NextResponse.json({ mensagem: 'Notificação deletada com sucesso' });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao deletar notificação', detalhes: String(e) }, { status: 500 });
    }
  }
};