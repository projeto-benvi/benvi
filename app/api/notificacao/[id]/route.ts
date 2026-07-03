import { notificacaoController } from '@/controller/notificacaoController';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireUser } from '@/app/lib/authz';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    await requireUser();
    return notificacaoController.buscarPorId(Number(params.id));
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
    await requireUser();
    return notificacaoController.marcarComoVisualizada(Number(params.id));
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
    await requireUser();
    return notificacaoController.deletar(Number(params.id));
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao deletar notificacao.' }, { status: 500 });
  }
}
