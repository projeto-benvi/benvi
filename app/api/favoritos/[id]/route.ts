import { favoritoController } from '@/controller/favoritoController';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireUser } from '@/app/lib/authz';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser();
    const { id } = await params;
    const idNum = Number(id);

    if (Number.isNaN(idNum)) {
      return NextResponse.json({ erro: 'ID inválido.' }, { status: 400 });
    }

    return favoritoController.buscarPorId(idNum);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao buscar favorito.' }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser();
    const { id } = await params;
    const idNum = Number(id);

    if (Number.isNaN(idNum)) {
      return NextResponse.json({ erro: 'ID inválido.' }, { status: 400 });
    }

    return favoritoController.deletarPorId(idNum);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao remover favorito.' }, { status: 500 });
  }
}
