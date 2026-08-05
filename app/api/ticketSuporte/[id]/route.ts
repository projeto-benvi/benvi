import { ticketSuporteController } from '@/controller/ticketSuporteController';
import { NextRequest } from 'next/server';
import { AuthorizationError, authErrorResponse, requireAdmin, requireUser } from '@/app/lib/authz';
import { ticketSuporteService } from '@/service/ticketSuporteService';
import { parseIdParam, respostaIdInvalido } from '@/app/lib/validacao';
import { genericApiError } from '@/app/lib/api-error';

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
    const id = parseIdParam(params.id);
    if (id === null) return respostaIdInvalido('id');
    const ownerId = await ticketSuporteService.buscarProprietario(id);
    if (ownerId === null) {
      throw new AuthorizationError('Ticket não encontrado.', 404);
    }
    if (!user.isAdmin && ownerId !== user.id) {
      throw new AuthorizationError('Voce nao tem permissao para acessar este ticket.', 403);
    }
    return ticketSuporteController.buscarPorId(id);
  } catch (error) {
    return authErrorResponse(error) ?? genericApiError(error, { context: 'ticket.buscar', publicMessage: 'Não foi possível buscar o ticket.', field: 'erro' });
  }
}

export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    await requireAdmin();
    const id = parseIdParam(params.id);
    if (id === null) return respostaIdInvalido('id');
    return ticketSuporteController.responder(id, req);
  } catch (error) {
    return authErrorResponse(error) ?? genericApiError(error, { context: 'ticket.responder', publicMessage: 'Não foi possível responder o ticket.', field: 'erro' });
  }
}

export async function DELETE(
  _: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    await requireAdmin();
    const id = parseIdParam(params.id);
    if (id === null) return respostaIdInvalido('id');
    return ticketSuporteController.deletar(id);
  } catch (error) {
    return authErrorResponse(error) ?? genericApiError(error, { context: 'ticket.excluir', publicMessage: 'Não foi possível excluir o ticket.', field: 'erro' });
  }
}
