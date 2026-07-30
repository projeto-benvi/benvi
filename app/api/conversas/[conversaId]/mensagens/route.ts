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

function parsePositiveInteger(value: string, campo: string, zeroAllowed = false) {
  const numero = Number(value);
  if (!Number.isSafeInteger(numero) || numero < (zeroAllowed ? 0 : 1)) {
    throw new Error(`${campo} inválido.`);
  }
  return numero;
}

function parseLimit(value: string | null) {
  if (value === null) return 30;
  const limite = parsePositiveInteger(value, 'limit');
  if (limite > 100) throw new Error('limit deve ser no máximo 100.');
  return limite;
}

function validarConteudo(value: unknown) {
  if (typeof value !== 'string' || !value.trim() || value.length > 5000) {
    throw new Error('Conteúdo de mensagem inválido.');
  }
  const conteudo = value.trim();
  if (/data:[^;,]+;base64,/i.test(conteudo)) {
    throw new Error('Anexos estão temporariamente indisponíveis neste chat.');
  }
  try {
    const parsed = JSON.parse(conteudo);
    if (parsed && typeof parsed === 'object' && ('url' in parsed || 'mimeType' in parsed)) {
      throw new Error('Anexos estão temporariamente indisponíveis neste chat.');
    }
  } catch (erro) {
    if (erro instanceof Error && erro.message.startsWith('Anexos')) throw erro;
  }
  return conteudo;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireUser();
    const { conversaId } = await params;
    const idConversa = parsePositiveInteger(conversaId, 'conversaId');
    await assertConversaAccess(idConversa, user);

    const afterId = request.nextUrl.searchParams.get('afterId');
    const beforeId = request.nextUrl.searchParams.get('beforeId');
    if (afterId !== null && beforeId !== null) throw new Error('Use apenas afterId ou beforeId.');
    const limite = parseLimit(request.nextUrl.searchParams.get('limit'));

    const resultado =
      afterId !== null
        ? await mensagemController.listarMensagensDesdeId(
            idConversa,
            parsePositiveInteger(afterId, 'afterId', true),
            limite
          )
        : beforeId !== null
          ? await mensagemController.listarMensagensAntes(
              idConversa,
              parsePositiveInteger(beforeId, 'beforeId'),
              limite
            )
          : await mensagemController.listarUltimasMensagens(idConversa, limite);

    await mensagemController.marcarComoLidas(idConversa, user.id);
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
    const idConversa = parsePositiveInteger(conversaId, 'conversaId');
    await assertConversaAccess(idConversa, user);
    const corpo = await request.json();
    const conteudo = validarConteudo(corpo.conteudo);
    const resultado = await mensagemController.enviarMensagem({
      idConversa,
      idRemetente: user.id,
      conteudo,
      clientTempId:
        typeof corpo.clientTempId === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(corpo.clientTempId)
          ? corpo.clientTempId
          : undefined,
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
