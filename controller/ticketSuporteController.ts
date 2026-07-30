import { ticketSuporteService } from '@/service/ticketSuporteService';
import { NextResponse, NextRequest } from 'next/server';

export const ticketSuporteController = {
  async criar(req: NextRequest, idUsuarioAutenticado?: number) {
    try {
      const body = await req.json();
      const { id_usuario, titulo, descricao, categoria, prioridade, id_prestador, id_servico } = body;
      const idUsuario = idUsuarioAutenticado ?? Number(id_usuario);

      if (!idUsuario || !titulo || !descricao) {
        return NextResponse.json({ erro: 'Campos obrigatórios ausentes' }, { status: 400 });
      }

      if (body.arquivo || body.anexo || body.documento || body.comprovante) {
        return NextResponse.json(
          { erro: 'Upload de documentos privados depende de storage privado e ainda nao esta habilitado.' },
          { status: 503 }
        );
      }

      const novoTicket = await ticketSuporteService.criar({
        id_usuario: idUsuario,
        titulo,
        descricao,
        categoria: categoria || 'geral',
        prioridade: prioridade || 'media',
        id_prestador: id_prestador ? Number(id_prestador) : null,
        id_servico: id_servico ? Number(id_servico) : null,
      });
      return NextResponse.json(novoTicket, { status: 201 });
    } catch {
      return NextResponse.json({ erro: 'Erro ao criar ticket' }, { status: 500 });
    }
  },

  async listar(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const idUsuario = searchParams.get('id_usuario');
      if (idUsuario) return NextResponse.json(await ticketSuporteService.listarPorUsuario(Number(idUsuario)));
      return NextResponse.json(await ticketSuporteService.listarTodos());
    } catch {
      return NextResponse.json({ erro: 'Erro ao listar tickets' }, { status: 500 });
    }
  },

  async buscarPorId(id: number) {
    try {
      const ticket = await ticketSuporteService.buscarPorId(id);
      if (!ticket) return NextResponse.json({ erro: 'Ticket não encontrado' }, { status: 404 });
      return NextResponse.json(ticket);
    } catch {
      return NextResponse.json({ erro: 'Erro ao buscar ticket' }, { status: 500 });
    }
  },

  async responder(id: number, req: NextRequest) {
    try {
      const body = await req.json();
      const { status, resposta_admin, mensagem, encerrar, id_usuario_resposta } = body;
      const textoResposta = resposta_admin || mensagem;

      if (!status || !textoResposta) {
        return NextResponse.json({ erro: 'Status e resposta são obrigatórios' }, { status: 400 });
      }

      const atualizado = await ticketSuporteService.responderTicket(
        id,
        status,
        textoResposta,
        !!encerrar,
        id_usuario_resposta ? Number(id_usuario_resposta) : undefined
      );
      if (!atualizado) return NextResponse.json({ erro: 'Ticket não encontrado para atualização' }, { status: 404 });
      return NextResponse.json({ mensagem: 'Ticket atualizado/respondido com sucesso' });
    } catch {
      return NextResponse.json({ erro: 'Erro ao responder ticket' }, { status: 500 });
    }
  },

  async deletar(id: number) {
    try {
      const deletado = await ticketSuporteService.deletar(id);
      if (!deletado) return NextResponse.json({ erro: 'Ticket não encontrado para exclusão' }, { status: 404 });
      return NextResponse.json({ mensagem: 'Ticket deletado com sucesso' });
    } catch {
      return NextResponse.json({ erro: 'Erro ao deletar ticket' }, { status: 500 });
    }
  }
};
