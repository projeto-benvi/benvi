import { ticketSuporteController } from '@/controller/ticketSuporteController';
import { NextRequest } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  return ticketSuporteController.buscarPorId(Number(params.id));
}

export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  return ticketSuporteController.responder(Number(params.id), req);
}

export async function DELETE(
  _: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  return ticketSuporteController.deletar(Number(params.id));
}