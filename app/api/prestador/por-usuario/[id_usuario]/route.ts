import { prestadorController } from '@/controller/prestadorController';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireResourceOwner, requireUser } from '@/app/lib/authz';
import { parseIdParam, respostaIdInvalido } from '@/app/lib/validacao';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id_usuario: string }> }
) {
  const { id_usuario } = await params;
  const idNum = parseIdParam(id_usuario);
  if (idNum === null) {
    return respostaIdInvalido('id_usuario');
  }
  return prestadorController.buscarPorIdUsuario(idNum);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id_usuario: string }> }
) {
  try {
    const user = await requireUser();
    const { id_usuario } = await params;
    const idNum = parseIdParam(id_usuario);
    if (idNum === null) {
      return respostaIdInvalido('id_usuario');
    }
    requireResourceOwner(user, idNum);
    return prestadorController.atualizarPorIdUsuario(idNum, req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao atualizar prestador.' }, { status: 500 });
  }
}
