import { usuarioController } from '@/controller/usuarioController';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireAdmin } from '@/app/lib/authz';

// GET  /api/usuario                                    → lista todos (público)
// GET  /api/usuario?admin=contagem    → contagem admin
// GET  /api/usuario?admin=usuarios    → lista usuários admin
// GET  /api/usuario?admin=prestadores → lista prestadores admin
// GET  /api/usuario?admin=dashboard   → resumo dashboard admin
// GET  /api/usuario?admin=tickets     → tickets pendentes admin
// POST /api/usuario                                    → cria usuário (público)
// POST /api/usuario?admin=criar                       → cria usuário como admin

export async function GET(req: NextRequest) {
  try {
    const admin = new URL(req.url).searchParams.get('admin');

    if (admin) {
      const user = await requireAdmin();
      if (admin === 'contagem')    return usuarioController.adminContarUsuarios(req, user.id);
      if (admin === 'usuarios')    return usuarioController.adminListarUsuarios(req, user.id);
      if (admin === 'prestadores') return usuarioController.adminListarPrestadores(req, user.id);
      if (admin === 'dashboard')   return usuarioController.adminDashboard(req, user.id);
      if (admin === 'tickets')     return usuarioController.adminTicketsPendentes(req, user.id);
    }

    await requireAdmin();
    return usuarioController.listar();
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao listar usuarios.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = new URL(req.url).searchParams.get('admin');

    if (admin === 'criar') {
      const user = await requireAdmin();
      return usuarioController.adminCriarUsuario(req, user.id);
    }

    return usuarioController.criar(req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao criar usuario.' }, { status: 500 });
  }
}
