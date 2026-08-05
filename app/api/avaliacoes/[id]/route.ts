import { NextResponse } from 'next/server';
import { AvaliacaoController } from '@/controller/avaliacaoController';
import { AuthorizationError, authErrorResponse, requireUser } from '@/app/lib/authz';
import { genericApiError } from '@/app/lib/api-error';
import { AvaliacaoService } from '@/service/avaliacaoService';
import { parseIdParam, respostaIdInvalido } from '@/app/lib/validacao';

type RouteContext = { params: Promise<{ id: string }> };

async function assertAvaliacaoOwner(id: number, user: { id: number; isAdmin: boolean }) {
  const ownerId = await AvaliacaoService.buscarAutorId(id);
  if (ownerId === null) throw new AuthorizationError('Avaliação não encontrada.', 404);
  if (!user.isAdmin && ownerId !== user.id) {
    throw new AuthorizationError('Voce nao tem permissao para alterar esta avaliação.', 403);
  }
}

async function parseAvaliacaoId(params: RouteContext['params']) {
  const { id } = await params;
  return parseIdParam(id);
}

function validarAtualizacao(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AuthorizationError('Payload de atualização inválido.', 400);
  }
  const dados = body as Record<string, unknown>;
  if (Object.keys(dados).some((campo) => !['nota', 'comentario'].includes(campo))) {
    throw new AuthorizationError('Payload contém campos não permitidos.', 400);
  }
  const nota = Number(dados.nota);
  if (!Number.isFinite(nota) || nota < 0 || nota > 5) {
    throw new AuthorizationError('Nota deve estar entre 0 e 5.', 400);
  }
  if (typeof dados.comentario !== 'string' || dados.comentario.length > 2000) {
    throw new AuthorizationError('Comentário inválido.', 400);
  }
  return { nota, comentario: dados.comentario.trim() };
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const user = await requireUser();
    await params;
    const body = await request.json();
    const idAvaliacao = await AvaliacaoController.criar(
      user.id,
      Number(body.id_prestador ?? body.idPrestador ?? body.prestadorId),
      Number(body.id_servico),
      Number(body.nota_geral ?? body.nota ?? 5),
      body.comentario || '',
      Number(body.comunicacao ?? 5),
      Number(body.respeito ?? 5),
      Number(body.pontualidade ?? 5),
      Number(body.acordo ?? 5)
    );
    return NextResponse.json(
      { id_avaliacao: idAvaliacao, message: 'Avaliação criada com sucesso' },
      { status: 201 }
    );
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return genericApiError(error, {
      context: 'avaliacao.criar',
      publicMessage: 'Não foi possível criar a avaliação.',
      status: 400,
    });
  }
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireUser();
    const id = await parseAvaliacaoId(params);
    if (id === null) return respostaIdInvalido('id');
    const avaliacao = await AvaliacaoController.buscarPorId(id);
    return NextResponse.json(avaliacao, { status: 200 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return genericApiError(error, {
      context: 'avaliacao.buscar',
      publicMessage: 'Avaliação não encontrada.',
      status: 404,
    });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const user = await requireUser();
    const idAvaliacao = await parseAvaliacaoId(params);
    if (idAvaliacao === null) return respostaIdInvalido('id');
    await assertAvaliacaoOwner(idAvaliacao, user);
    const body = await request.json();
    const dados = validarAtualizacao(body);
    await AvaliacaoController.atualizar(idAvaliacao, dados.nota, dados.comentario);
    return NextResponse.json({ message: 'Avaliação atualizada' }, { status: 200 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return genericApiError(error, {
      context: 'avaliacao.atualizar',
      publicMessage: 'Não foi possível atualizar a avaliação.',
      status: 400,
    });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireUser();
    const idAvaliacao = await parseAvaliacaoId(params);
    if (idAvaliacao === null) return respostaIdInvalido('id');
    await assertAvaliacaoOwner(idAvaliacao, user);
    await AvaliacaoController.remover(idAvaliacao);
    return NextResponse.json({ message: 'Avaliação removida' }, { status: 200 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return genericApiError(error, {
      context: 'avaliacao.remover',
      publicMessage: 'Não foi possível remover a avaliação.',
      status: 400,
    });
  }
}
