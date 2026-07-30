import { NextRequest, NextResponse } from 'next/server';
import { prestadorController } from '@/controller/prestadorController';
import { authErrorResponse, requireResourceOwner, requireUser } from '@/app/lib/authz';
import { parseIdParam, respostaIdInvalido } from '@/app/lib/validacao';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = parseIdParam(id);

  if (idNum === null) {
    return respostaIdInvalido('id');
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
    const idNum = parseIdParam(id);
    if (idNum === null) {
      return respostaIdInvalido('id');
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
    const idNum = parseIdParam(id);
    if (idNum === null) {
      return respostaIdInvalido('id');
    }
    requireResourceOwner(user, idNum);
    return prestadorController.deletar(idNum);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao deletar prestador.' }, { status: 500 });
  }
}
