import { NextRequest, NextResponse } from 'next/server';
import { prestadorController } from '@/controller/prestadorController';
import { authErrorResponse, requireResourceOwner, requireUser } from '@/app/lib/authz';

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
  try {
    const user = await requireUser();
    const { id } = await params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return Response.json({ erro: 'ID inválido' }, { status: 400 });
    }
    requireResourceOwner(user, idNum);
    return prestadorController.atualizar(idNum, req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao atualizar prestador.' }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return Response.json({ erro: 'ID inválido' }, { status: 400 });
    }
    requireResourceOwner(user, idNum);
    return prestadorController.deletar(idNum);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao deletar prestador.' }, { status: 500 });
  }
}
