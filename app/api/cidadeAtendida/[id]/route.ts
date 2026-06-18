import { cidadeAtendidaController } from '@/controller/cidadeAtendidaController';
import { NextRequest } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  return cidadeAtendidaController.buscarPorId(Number(params.id));
}

export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  return cidadeAtendidaController.atualizar(Number(params.id), req);
}

export async function DELETE(
  _: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  return cidadeAtendidaController.deletar(Number(params.id));
}