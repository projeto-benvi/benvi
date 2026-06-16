import { usuarioController } from '@/controller/usuarioController';
import { NextRequest } from 'next/server';

// GET  /api/usuario                                    → lista todos (público)
// GET  /api/usuario?admin=contagem&id_solicitante=1    → contagem admin
// GET  /api/usuario?admin=usuarios&id_solicitante=1    → lista usuários admin
// GET  /api/usuario?admin=prestadores&id_solicitante=1 → lista prestadores admin
// GET  /api/usuario?admin=dashboard&id_solicitante=1   → resumo dashboard admin
// GET  /api/usuario?admin=tickets&id_solicitante=1     → tickets pendentes admin
// POST /api/usuario                                    → cria usuário (público)
// POST /api/usuario?admin=criar&id_solicitante=1       → cria usuário como admin

export async function GET(req: NextRequest) {
  const admin = new URL(req.url).searchParams.get('admin');

  if (admin === 'contagem')    return usuarioController.adminContarUsuarios(req);
  if (admin === 'usuarios')    return usuarioController.adminListarUsuarios(req);
  if (admin === 'prestadores') return usuarioController.adminListarPrestadores(req);
  if (admin === 'dashboard')   return usuarioController.adminDashboard(req);
  if (admin === 'tickets')     return usuarioController.adminTicketsPendentes(req);

  return usuarioController.listar();
}

export async function POST(req: NextRequest) {
  const admin = new URL(req.url).searchParams.get('admin');

  if (admin === 'criar') return usuarioController.adminCriarUsuario(req);

  return usuarioController.criar(req);
}