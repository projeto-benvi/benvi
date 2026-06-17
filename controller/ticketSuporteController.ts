import { ticketSuporteService } from '@/service/ticketSuporteService';
import { NextResponse, NextRequest } from 'next/server';

export const ticketSuporteController = {
  async criar(req: NextRequest) {
    try {
      const body = await req.json();
      const { id_usuario, titulo, descricao } = body;

      if (!id_usuario || !titulo || !descricao) {
        return NextResponse.json({ erro: 'Campos obrigatórios ausentes' }, { status: 400 });
      }

      const novoTicket = await ticketSuporteService.criar({ id_usuario, titulo, descricao });
      return NextResponse.json(novoTicket, { status: 201 });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao criar ticket', detalhes: String(e) }, { status: 500 });
    }
  },

  async listar(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const idUsuario = searchParams.get('id_usuario');

      // Se passar id_usuario na URL (?id_usuario=X), filtra. Senão, traz todos (Admin)
      if (idUsuario) {
        const tickets = await ticketSuporteService.listarPorUsuario(Number(idUsuario));
        return NextResponse.json(tickets);
      }

      const tickets = await ticketSuporteService.listarTodos();
      return NextResponse.json(tickets);
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao listar tickets', detalhes: String(e) }, { status: 500 });
    }
  },

  async buscarPorId(id: number) {
    try {
      const ticket = await ticketSuporteService.buscarPorId(id);
      if (!ticket) {
        return NextResponse.json({ erro: 'Ticket não encontrado' }, { status: 404 });
      }
      return NextResponse.json(ticket);
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao buscar ticket', detalhes: String(e) }, { status: 500 });
    }
  },

  async responder(id: number, req: NextRequest) {
    try {
      const body = await req.json();
      const { status, resposta_admin, encerrar } = body; // encerrar é um boolean (true/false)

      if (!status || !resposta_admin) {
        return NextResponse.json({ erro: 'Status e resposta do admin são obrigatórios' }, { status: 400 });
      }

      const atualizado = await ticketSuporteService.responderTicket(id, status, resposta_admin, !!encerrar);
      if (!atualizado) {
        return NextResponse.json({ erro: 'Ticket não encontrado para atualização' }, { status: 404 });
      }

      return NextResponse.json({ mensagem: 'Ticket atualizado/respondido com sucesso' });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao responder ticket', detalhes: String(e) }, { status: 500 });
    }
  },

  async deletar(id: number) {
    try {
      const deletado = await ticketSuporteService.deletar(id);
      if (!deletado) {
        return NextResponse.json({ erro: 'Ticket não encontrado para exclusão' }, { status: 404 });
      }
      return NextResponse.json({ mensagem: 'Ticket deletado com sucesso' });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao deletar ticket', detalhes: String(e) }, { status: 500 });
    }
  }
};