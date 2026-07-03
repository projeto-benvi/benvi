import { favoritoController } from '@/controller/favoritoController';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireUser } from '@/app/lib/authz';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    return favoritoController.listar(req, user.id);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao listar favoritos.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    return favoritoController.criar(req, user.id);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao criar favorito.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    return favoritoController.deletarPorUsuarioPrestador(req, user.id);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao remover favorito.' }, { status: 500 });
  }
}
