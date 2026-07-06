import { usuarioController } from '@/controller/usuarioController';
import pool from '@/app/lib/dataBase';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireAdmin, requireResourceOwner, requireUser } from '@/app/lib/authz';

// GET    /api/usuario/[id]                                   → busca por id (público)
// PUT    /api/usuario/[id]                                   → atualiza (próprio usuário)
// PATCH  /api/usuario/[id]?admin=desativar&id_solicitante=1  → soft delete admin
// PATCH  /api/usuario/[id]?admin=reativar&id_solicitante=1   → reativa usuário admin
// DELETE /api/usuario/[id]                                   → hard delete

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    const user = await requireUser();
    requireResourceOwner(user, id);
    const { senha } = await req.json(); 

    if (!senha) {
      return NextResponse.json({ erro: 'A senha é obrigatória para excluir a conta.' }, { status: 400 });
    }

   
    const [rows]: any = await pool.query(
      'SELECT senha FROM usuario WHERE id_usuario = ?', [id]
    );
    const usuario = rows[0];

    if (!usuario) {
      return NextResponse.json({ erro: 'Usuário não encontrado.' }, { status: 404 });
    }

    
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return NextResponse.json({ erro: 'Senha incorreta. Ação cancelada.' }, { status: 400 });
    }

    
    return usuarioController.deletar(id);

  } catch (error) {
    console.error('Erro ao processar exclusão de conta:', error);
    return NextResponse.json({ erro: 'Erro interno ao tentar deletar o usuário.' }, { status: 500 });
  }
}
