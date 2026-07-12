import { servicoController } from '@/controller/servicoController';
import pool from '@/app/lib/dataBase';
import { NextRequest, NextResponse } from 'next/server';
import { AuthenticatedUser, AuthorizationError, authErrorResponse, requireResourceOwner, requireUser } from '@/app/lib/authz';
import { parseIdParam, respostaIdInvalido } from '@/app/lib/validacao';

type RouteContext = {
  params: Promise<{ id: string }>; // Definindo params como uma Promise
};

async function assertServicoOwner(idServico: number, user: AuthenticatedUser) {
  const [rows]: any = await pool.query('SELECT id_prestador FROM servico WHERE id_servico = ?', [idServico]);
  const servico = rows[0];
  if (!servico) throw new AuthorizationError('Servico nao encontrado.', 404);
  requireResourceOwner(user, servico.id_prestador);
}

export async function GET(
  _: NextRequest,
  { params }: RouteContext
) {
  const resolvedParams = await params; // Aguarda os parâmetros resolverem
  const idServico = parseIdParam(resolvedParams.id);
  if (idServico === null) {
    return respostaIdInvalido('id');
  }
  return servicoController.buscarPorId(idServico);
}

export async function PUT(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = await requireUser();
    const resolvedParams = await params;
    const idServico = parseIdParam(resolvedParams.id);
    if (idServico === null) return respostaIdInvalido('id');
    await assertServicoOwner(idServico, user);
    return servicoController.atualizar(idServico, req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao atualizar servico.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = await requireUser();
    const resolvedParams = await params;
    const idServico = parseIdParam(resolvedParams.id);
    if (idServico === null) return respostaIdInvalido('id');
    await assertServicoOwner(idServico, user);
    // Repassa para o método atualizar do seu controller
    return servicoController.atualizar(idServico, req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao atualizar servico.' }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = await requireUser();
    const resolvedParams = await params; // <--- Isso resolve o erro do NaN!
    const idServico = parseIdParam(resolvedParams.id);
    if (idServico === null) return respostaIdInvalido('id');
    await assertServicoOwner(idServico, user);
    return servicoController.deletar(idServico);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao deletar servico.' }, { status: 500 });
  }
}
