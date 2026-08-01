import { NextResponse } from 'next/server';
import { AvaliacaoController } from '@/controller/avaliacaoController';
import { AuthorizationError, authErrorResponse, requireUser } from '@/app/lib/authz';
import { genericApiError } from '@/app/lib/api-error';
import { AvaliacaoService } from '@/service/avaliacaoService';

type RouteContext = { params: Promise<{ id: string }> };

async function assertAvaliacaoOwner(id: number, user: { id: number; isAdmin: boolean }) {
  const ownerId = await AvaliacaoService.buscarAutorId(id);
  if (ownerId === null) throw new AuthorizationError('Avaliação não encontrada.', 404);
  if (!user.isAdmin && ownerId !== user.id) {
    throw new AuthorizationError('Voce nao tem permissao para alterar esta avaliação.', 403);
  }
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
    const { id } = await params;
    const avaliacao = await AvaliacaoController.buscarPorId(Number(id));
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
    const { id } = await params;
    const idAvaliacao = Number(id);
    await assertAvaliacaoOwner(idAvaliacao, user);
    const body = await request.json();
    await AvaliacaoController.atualizar(idAvaliacao, body.nota, body.comentario);
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
    const { id } = await params;
    const idAvaliacao = Number(id);
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
