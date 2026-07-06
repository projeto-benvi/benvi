import { ticketSuporteController } from '@/controller/ticketSuporteController';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireAdmin, requireUser } from '@/app/lib/authz';

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
    return ticketSuporteController.buscarPorId(Number(params.id));
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
