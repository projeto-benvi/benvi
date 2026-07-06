import { notificacaoController } from '@/controller/notificacaoController';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireAdmin, requireResourceOwner, requireUser } from '@/app/lib/authz';

//http://localhost:3000/api/notificacao?id_usuario=3 - Listar notificações do usuário
//http://localhost:3000/api/notificacao/1 - Buscar notificação por ID, marcar como visualizada ou deletar

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    return notificacaoController.criar(req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao criar notificacao.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const idUsuario = req.nextUrl.searchParams.get('id_usuario');
    requireResourceOwner(user, idUsuario);
    return notificacaoController.listarPorUsuario(req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao listar notificacoes.' }, { status: 500 });
  }
}
