import { notificacaoController } from '@/controller/notificacaoController';
import { NextRequest } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  return notificacaoController.buscarPorId(Number(params.id));
}

export async function PATCH(
  _: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  return notificacaoController.marcarComoVisualizada(Number(params.id));
}

export async function DELETE(
  _: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  return notificacaoController.deletar(Number(params.id));
}