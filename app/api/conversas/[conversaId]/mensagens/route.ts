import { MensagemController } from '@/controller/mensagemController';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/dataBase';
import { AuthorizationError, authErrorResponse, requireUser } from '@/app/lib/authz';

const mensagemController = new MensagemController();

async function assertConversaAccess(idConversa: number, user: { id: number; isAdmin: boolean }) {
  const [rows]: any = await pool.query(
    'SELECT idUsuario, idPrestador FROM conversas WHERE idConversa = ?',
    [idConversa]
  );
  const conversa = rows[0];

  if (!conversa) throw new AuthorizationError('Conversa nao encontrada.', 404);
  if (!user.isAdmin && Number(conversa.idUsuario) !== user.id && Number(conversa.idPrestador) !== user.id) {
    throw new AuthorizationError('Voce nao tem permissao para acessar esta conversa.', 403);
  }
}

type RouteContext = {
  params: Promise<{ conversaId: string }>;
};

export async function GET(_: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireUser();
    const { conversaId } = await params;
    await assertConversaAccess(Number(conversaId), user);
    const resultado = await mensagemController.listarMensagens(conversaId);
    return NextResponse.json(resultado, { status: 200 });
  } catch (erro) {
    const authResponse = authErrorResponse(erro);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : 'Erro ao listar mensagens.' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireUser();
    const { conversaId } = await params;
    await assertConversaAccess(Number(conversaId), user);
    const corpo = await request.json();
    const resultado = await mensagemController.enviarMensagem({
      ...corpo,
      idConversa: conversaId,
      idRemetente: user.id,
    });
    return NextResponse.json(resultado, { status: 201 });
  } catch (erro) {
    const authResponse = authErrorResponse(erro);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : 'Erro ao enviar mensagem.' },
      { status: 400 }
    );
  }
}
