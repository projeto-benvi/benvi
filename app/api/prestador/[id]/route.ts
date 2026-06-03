import { prestadorController } from '@/controller/prestadorController';
import { NextRequest } from 'next/server';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = parseInt(id);
  if (isNaN(idNum)) {
    return Response.json({ erro: 'ID inválido' }, { status: 400 });
  }
  return prestadorController.buscarPorId(idNum);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = parseInt(id);
  if (isNaN(idNum)) {
    return Response.json({ erro: 'ID inválido' }, { status: 400 });
  }
  return prestadorController.atualizar(idNum, req);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = parseInt(id);
  if (isNaN(idNum)) {
    return Response.json({ erro: 'ID inválido' }, { status: 400 });
  }
  return prestadorController.deletar(idNum);
}