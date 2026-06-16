import { alertaController } from '@/controller/alertaController';
import { NextRequest } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  return alertaController.buscarPorId(Number(params.id));
}

export async function DELETE(
  _: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  return alertaController.deletar(Number(params.id));
}