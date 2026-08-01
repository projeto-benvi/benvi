import { ticketSuporteController } from '@/controller/ticketSuporteController';
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError, authErrorResponse, requireAdmin, requireUser } from '@/app/lib/authz';
import { ticketSuporteService } from '@/service/ticketSuporteService';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const user = await requireUser();
    const id = Number(params.id);
    const ownerId = await ticketSuporteService.buscarProprietario(id);
    if (ownerId === null) {
      throw new AuthorizationError('Ticket não encontrado.', 404);
    }
    if (!user.isAdmin && ownerId !== user.id) {
      throw new AuthorizationError('Voce nao tem permissao para acessar este ticket.', 403);
    }
    return ticketSuporteController.buscarPorId(id);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao buscar ticket.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    await requireAdmin();
    return ticketSuporteController.responder(Number(params.id), req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao responder ticket.' }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    await requireAdmin();
    return ticketSuporteController.deletar(Number(params.id));
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao deletar ticket.' }, { status: 500 });
  }
}
