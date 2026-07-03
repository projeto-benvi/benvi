import { cidadeAtendidaController } from '@/controller/cidadeAtendidaController';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireAdmin } from '@/app/lib/authz';

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
  try {
    const params = await context.params;
    await requireAdmin();
    return cidadeAtendidaController.atualizar(Number(params.id), req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao atualizar cidade atendida.' }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    await requireAdmin();
    return cidadeAtendidaController.deletar(Number(params.id));
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao deletar cidade atendida.' }, { status: 500 });
  }
}
