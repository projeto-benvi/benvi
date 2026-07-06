import { usuarioController } from '@/controller/usuarioController';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireAdmin, requireResourceOwner, requireUser } from '@/app/lib/authz';

// GET    /api/usuario/[id]                                   → busca por id (público)
// PUT    /api/usuario/[id]                                   → atualiza (próprio usuário)
// PATCH  /api/usuario/[id]?admin=desativar  → soft delete admin
// PATCH  /api/usuario/[id]?admin=reativar   → reativa usuário admin
// DELETE /api/usuario/[id]                                   → desativado; use /api/usuario/me

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireUser();
    requireResourceOwner(user, id);
    return usuarioController.buscarPorId(Number(id));
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao buscar usuario.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireUser();
    requireResourceOwner(user, id);

    // Aqui o Next.js passa a requisição completa (com o FormData da foto) para o controller
    return usuarioController.atualizar(Number(id), req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao atualizar usuario.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = new URL(req.url).searchParams.get('admin');
    const user = await requireAdmin();

    if (admin === 'desativar') return usuarioController.adminDesativarUsuario(Number(id), req, user.id);
    if (admin === 'reativar')  return usuarioController.adminReativarUsuario(Number(id), req, user.id);

    return NextResponse.json({ erro: 'Ação não reconhecida. Use ?admin=desativar ou ?admin=reativar' }, { status: 400 });
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao atualizar usuario.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await requireUser();
    return NextResponse.json(
      { erro: 'Use a rota segura /api/usuario/me para excluir a própria conta.' },
      { status: 400 }
    );
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao excluir usuario.' }, { status: 500 });
  }
}
