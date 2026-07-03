import { ticketSuporteController } from '@/controller/ticketSuporteController';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireAdmin, requireResourceOwner, requireUser } from '@/app/lib/authz';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    return ticketSuporteController.criar(req, user.id);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao criar ticket.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const idUsuario = req.nextUrl.searchParams.get('id_usuario');
    if (idUsuario) {
      requireResourceOwner(user, idUsuario);
    } else {
      await requireAdmin();
    }
    return ticketSuporteController.listar(req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao listar tickets.' }, { status: 500 });
  }
}
