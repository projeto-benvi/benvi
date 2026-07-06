import { prestadorController } from '@/controller/prestadorController';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireUser } from '@/app/lib/authz';

export async function GET(req: NextRequest) {
  return prestadorController.listar(req);
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    return prestadorController.criar(req, user.id);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao criar prestador.' }, { status: 500 });
  }
}
