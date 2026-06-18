import { servicoController } from '@/controller/servicoController';
import { NextRequest } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>; // Definindo params como uma Promise
};

export async function GET(
  _: NextRequest,
  { params }: RouteContext
) {
  const resolvedParams = await params; // Aguarda os parâmetros resolverem
  return servicoController.buscarPorId(Number(resolvedParams.id));
}

export async function PUT(
  req: NextRequest,
  { params }: RouteContext
) {
  const resolvedParams = await params;
  return servicoController.atualizar(Number(resolvedParams.id), req);
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
) {
  const resolvedParams = await params;
  // Repassa para o método atualizar do seu controller
  return servicoController.atualizar(Number(resolvedParams.id), req);
}

export async function DELETE(
  _: NextRequest,
  { params }: RouteContext
) {
  const resolvedParams = await params; // <--- Isso resolve o erro do NaN!
  return servicoController.deletar(Number(resolvedParams.id));
}