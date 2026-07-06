import { authErrorResponse, requireAdmin } from '@/app/lib/authz';
import { adminService } from '@/service/usuarioService';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function mapAdminPermissionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message === 'USUARIO_NAO_ENCONTRADO') {
    return NextResponse.json({ erro: 'Usuário não encontrado.' }, { status: 404 });
  }

  if (message === 'ULTIMO_ADMIN') {
    return NextResponse.json(
      { erro: 'Não é possível remover o último administrador ativo do sistema.' },
      { status: 409 }
    );
  }

  console.error('Erro seguro na rota administrativa de permissao.', {
    tipo: error instanceof Error ? error.name : typeof error,
    mensagem: message,
  });

  return NextResponse.json({ erro: 'Erro ao atualizar permissão administrativa.' }, { status: 500 });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const idUsuario = Number(id);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return NextResponse.json({ erro: 'Usuário inválido.' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const acao = body?.acao;

    if (acao !== 'promover' && acao !== 'remover') {
      return NextResponse.json({ erro: 'Ação inválida.' }, { status: 400 });
    }

    const resultado = await adminService.alterarPermissaoAdministrador(
      admin.id,
      idUsuario,
      acao === 'promover'
    );

    return NextResponse.json({
      mensagem: acao === 'promover' ? 'Usuário promovido a administrador.' : 'Permissão de administrador removida.',
      is_admin: resultado.is_admin,
    });
  } catch (error) {
    return authErrorResponse(error) ?? mapAdminPermissionError(error);
  }
}
