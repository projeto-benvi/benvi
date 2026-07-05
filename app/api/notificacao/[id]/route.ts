import { notificacaoController } from '@/controller/notificacaoController';
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError, authErrorResponse, requireUser, type AuthenticatedUser } from '@/app/lib/authz';
import { notificacaoService } from '@/service/notificacaoService';

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function assertNotificationAccess(id: number, user: AuthenticatedUser) {
  const notificacao = await notificacaoService.buscarPorId(id);

  if (!notificacao) {
    throw new AuthorizationError('Notificacao nao encontrada.', 404);
  }

  if (!user.isAdmin && Number(notificacao.id_usuario) !== user.id) {
    throw new AuthorizationError('Voce nao tem permissao para acessar esta notificacao.', 403);
  }
}

export async function GET(
  _: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const user = await requireUser();
    const id = Number(params.id);
    await assertNotificationAccess(id, user);
    return notificacaoController.buscarPorId(id);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao buscar notificacao.' }, { status: 500 });
  }
}

export async function PATCH(
  _: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const user = await requireUser();
    const id = Number(params.id);
    await assertNotificationAccess(id, user);
    return notificacaoController.marcarComoVisualizada(id);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao atualizar notificacao.' }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const user = await requireUser();
    const id = Number(params.id);
    await assertNotificationAccess(id, user);
    return notificacaoController.deletar(id);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao deletar notificacao.' }, { status: 500 });
  }
}
