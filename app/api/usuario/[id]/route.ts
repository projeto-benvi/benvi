import { usuarioController } from '@/controller/usuarioController';
import { NextRequest } from 'next/server';

// GET    /api/usuario/[id]                                   → busca por id (público)
// PUT    /api/usuario/[id]                                   → atualiza (próprio usuário)
// PATCH  /api/usuario/[id]?admin=desativar&id_solicitante=1  → soft delete admin
// PATCH  /api/usuario/[id]?admin=reativar&id_solicitante=1   → reativa usuário admin
// DELETE /api/usuario/[id]                                   → hard delete

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return usuarioController.buscarPorId(Number(id));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return usuarioController.atualizar(Number(id), req);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = new URL(req.url).searchParams.get('admin');

  if (admin === 'desativar') return usuarioController.adminDesativarUsuario(Number(id), req);
  if (admin === 'reativar')  return usuarioController.adminReativarUsuario(Number(id), req);

  return new Response(JSON.stringify({ erro: 'Ação não reconhecida. Use ?admin=desativar ou ?admin=reativar' }), { status: 400 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return usuarioController.deletar(Number(id));
}