// app/api/mensagens/route.ts
import { NextResponse } from 'next/server';
import { MensagemController } from '@/controller/mensagemController';
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

// POST: Enviar uma mensagem
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const corpo = await request.json();
    await assertConversaAccess(Number(corpo.idConversa), user);
    const resultado = await mensagemController.enviarMensagem({
      ...corpo,
      idRemetente: user.id,
    });
    return NextResponse.json(resultado, { status: 201 });
  } catch (erro: any) {
    const authResponse = authErrorResponse(erro);
    if (authResponse) return authResponse;

    return NextResponse.json({ erro: erro.message }, { status: 400 });
  }
}

// GET: Listar histórico de uma conversa ou novas mensagens após um cursor
// Exemplo de URL: /api/mensagens?idConversa=1
// Exemplo de URL de polling: /api/mensagens?idConversa=1&afterId=23
export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const idConversa = searchParams.get('idConversa');

    if (!idConversa) {
      return NextResponse.json({ erro: 'idConversa é obrigatório' }, { status: 400 });
    }

    await assertConversaAccess(Number(idConversa), user);

    await mensagemController.marcarComoLidas(
      Number(idConversa),
      user.id
    );
    
    const afterId = searchParams.get("afterId");
    const beforeId = searchParams.get("beforeId");
    const limit = Number(searchParams.get("limit") ?? 30);
    
    let resultado;
    console.log({
      afterId,
      beforeId,
      limit,
    });
    if (afterId) {
      resultado = await mensagemController.listarMensagensDesdeId(
        Number(idConversa),
        Number(afterId)
      );
    } else if (beforeId) {
      resultado = await mensagemController.listarMensagensAntes(
        Number(idConversa),
        Number(beforeId),
        limit
      );
    } else {
      resultado = await mensagemController.listarUltimasMensagens(
        Number(idConversa),
        limit
      );
    }

    return NextResponse.json(resultado, { status: 200 });
  } catch (erro: any) {
    return NextResponse.json({ erro: erro.message }, { status: 400 });
  }
}
