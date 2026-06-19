import { usuarioController } from '@/controller/usuarioController';
import { NextRequest, NextResponse } from 'next/server';

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

  // Aqui o Next.js passa a requisição completa (com o FormData da foto) para o controller
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
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
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