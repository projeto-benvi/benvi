// app/api/mensagens/route.ts
import { NextResponse } from 'next/server';
import { MensagemController } from '@/controller/mensagemController';
import pool from '@/app/lib/dataBase';
import { AuthorizationError, authErrorResponse, requireUser } from '@/app/lib/authz';

const mensagemController = new MensagemController();
const LIMITE_PADRAO = 30;
const LIMITE_MAXIMO = 100;

function parseId(value: unknown, campo: string, options?: { zeroAllowed?: boolean }) {
  const numero = Number(value);
  const minimo = options?.zeroAllowed ? 0 : 1;
  if (!Number.isSafeInteger(numero) || numero < minimo) {
    throw new Error(`${campo} inválido.`);
  }
  return numero;
}

function parseLimit(value: string | null) {
  if (value === null || value.trim() === '') return LIMITE_PADRAO;
  const limite = Number(value);
  if (!Number.isSafeInteger(limite) || limite < 1 || limite > LIMITE_MAXIMO) {
    throw new Error(`limit deve ser um inteiro entre 1 e ${LIMITE_MAXIMO}.`);
  }
  return limite;
}

function validarConteudo(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('conteudo é obrigatório.');
  }
  const conteudo = value.trim();
  if (conteudo.length > 5000) throw new Error('Mensagem excede o limite de 5000 caracteres.');
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
    const idConversa = parseId(corpo.idConversa, 'idConversa');
    const conteudo = validarConteudo(corpo.conteudo);
    const clientTempId =
      typeof corpo.clientTempId === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(corpo.clientTempId)
        ? corpo.clientTempId
        : undefined;
    await assertConversaAccess(idConversa, user);
    const resultado = await mensagemController.enviarMensagem({
      idConversa,
      idRemetente: user.id,
      conteudo,
      clientTempId,
    });
    return NextResponse.json(resultado, { status: 201 });
  } catch (erro: any) {
    const authResponse = authErrorResponse(erro);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : 'Requisição inválida.' },
      { status: 400 }
    );
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

    const conversaId = parseId(idConversa, 'idConversa');

    await assertConversaAccess(conversaId, user);

    await mensagemController.marcarComoLidas(
      conversaId,
      user.id
    );

    const afterId = searchParams.get("afterId");
    const beforeId = searchParams.get("beforeId");
    if (afterId !== null && beforeId !== null) {
      throw new Error('Use apenas afterId ou beforeId.');
    }
    const limit = parseLimit(searchParams.get("limit"));

    let resultado;
    if (afterId !== null) {
      resultado = await mensagemController.listarMensagensDesdeId(
        conversaId,
        parseId(afterId, 'afterId', { zeroAllowed: true }),
        limit
      );
    } else if (beforeId !== null) {
      resultado = await mensagemController.listarMensagensAntes(
        conversaId,
        parseId(beforeId, 'beforeId'),
        limit
      );
    } else {
      resultado = await mensagemController.listarUltimasMensagens(
        conversaId,
        limit
      );
    }

    return NextResponse.json(resultado, { status: 200 });
  } catch (erro) {
    const authResponse = authErrorResponse(erro);
    if (authResponse) return authResponse;
    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : 'Requisição inválida.' },
      { status: 400 }
    );
  }
}
