// app/api/conversas/route.ts
import { NextResponse } from 'next/server';
import { ConversaController } from '@/controller/conversaController'; // Ajuste o caminho se não usar @/
import { authErrorResponse, requireAdmin, requireResourceOwner, requireUser } from '@/app/lib/authz';

const conversaController = new ConversaController();

// POST: Criar ou buscar uma conversa
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const corpo = await request.json();
    const resultado = await conversaController.criarConversa({
      ...corpo,
      idUsuario: user.isAdmin && corpo.idUsuario ? corpo.idUsuario : user.id,
    });
    return NextResponse.json(resultado, { status: 200 });
  } catch (erro: any) {
    const authResponse = authErrorResponse(erro);
    if (authResponse) return authResponse;

    return NextResponse.json({ erro: erro.message }, { status: 400 });
  }
}

// GET: Listar conversas de um participante
// Exemplo de URL: /api/conversas?idParticipante=1&tipoParticipante=usuario
export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const idParticipante = searchParams.get('idParticipante');
    const tipoParticipante = searchParams.get('tipoParticipante') as 'usuario' | 'prestador' | 'admin';

    if (!tipoParticipante || (tipoParticipante !== 'admin' && !idParticipante)) {
      return NextResponse.json({ erro: 'Parâmetros ausentes' }, { status: 400 });
    }

    if (tipoParticipante === 'admin') {
      await requireAdmin();
    } else {
      requireResourceOwner(user, idParticipante);
    }

    const resultado = await conversaController.listarConversas(idParticipante || 0, tipoParticipante);
    return NextResponse.json(resultado, { status: 200 });
  } catch (erro: any) {
    const authResponse = authErrorResponse(erro);
    if (authResponse) return authResponse;

    return NextResponse.json({ erro: erro.message }, { status: 400 });
  }
}
