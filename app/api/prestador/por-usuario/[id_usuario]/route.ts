import { prestadorController } from '@/controller/prestadorController';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireResourceOwner, requireUser } from '@/app/lib/authz';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id_usuario: string }> }
) {
  const { id_usuario } = await params;
  return prestadorController.buscarPorIdUsuario(Number(id_usuario));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id_usuario: string }> }
) {
  try {
    const user = await requireUser();
    const { id_usuario } = await params;
    requireResourceOwner(user, id_usuario);
    return prestadorController.atualizarPorIdUsuario(Number(id_usuario), req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao atualizar prestador.' }, { status: 500 });
  }
}
