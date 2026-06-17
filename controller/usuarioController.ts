import { usuarioService } from '@/service/usuarioService';
import { adminService } from '@/service/usuarioService';
import { NextRequest, NextResponse } from 'next/server';

// Helper para extrair id_solicitante e retornar erro padronizado
function getIdSolicitante(req: NextRequest): number | null {
  const id = Number(new URL(req.url).searchParams.get('id_solicitante'));
  return isNaN(id) || id === 0 ? null : id;
}

function erroAdmin(e: unknown) {
  const msg = String(e);
  const status = msg.includes('Acesso negado') ? 403
               : msg.includes('não encontrado') ? 404
               : 400;
  return NextResponse.json({ erro: msg }, { status });
}

export const usuarioController = {

  // ─── CRUD padrão ────────────────────────────────────────────────────────────

  async listar() {
    try {
      const usuarios = await usuarioService.listarTodos();
      return NextResponse.json(usuarios);
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao listar usuários' }, { status: 500 });
    }
  },

  async criar(req: NextRequest) {
    try {
      const body = await req.json();
      const id = await usuarioService.criar(body);
      return NextResponse.json({ id_usuario: id }, { status: 201 });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao criar usuário', detalhes: String(e) }, { status: 500 });
    }
  },

  async buscarPorId(id: number) {
    try {
      const usuario = await usuarioService.buscarPorId(id);
      if (!usuario) return NextResponse.json({ erro: 'Usuário não encontrado' }, { status: 404 });
      return NextResponse.json(usuario);
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao buscar usuário', detalhes: String(e) }, { status: 500 });
    }
  },

  async atualizar(id: number, req: NextRequest) {
    try {
      const body = await req.json();
      await usuarioService.atualizar(id, body);
      return NextResponse.json({ mensagem: 'Atualizado com sucesso' });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao atualizar usuário', detalhes: String(e) }, { status: 500 });
    }
  },

  async deletar(id: number) {
    try {
      await usuarioService.deletar(id);
      return NextResponse.json({ mensagem: 'Deletado com sucesso' });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao deletar usuário', detalhes: String(e) }, { status: 500 });
    }
  },

  // ─── Admin: leitura / dashboard ─────────────────────────────────────────────

  async adminContarUsuarios(req: NextRequest) {
    try {
      const id_solicitante = getIdSolicitante(req);
      if (!id_solicitante) return NextResponse.json({ erro: 'Informe id_solicitante' }, { status: 400 });
      return NextResponse.json(await adminService.contarUsuarios(id_solicitante));
    } catch (e) { return erroAdmin(e); }
  },

  async adminListarUsuarios(req: NextRequest) {
    try {
      const id_solicitante = getIdSolicitante(req);
      if (!id_solicitante) return NextResponse.json({ erro: 'Informe id_solicitante' }, { status: 400 });
      return NextResponse.json(await adminService.listarTodosUsuarios(id_solicitante));
    } catch (e) { return erroAdmin(e); }
  },

  async adminListarPrestadores(req: NextRequest) {
    try {
      const id_solicitante = getIdSolicitante(req);
      if (!id_solicitante) return NextResponse.json({ erro: 'Informe id_solicitante' }, { status: 400 });
      return NextResponse.json(await adminService.listarTodosPrestadores(id_solicitante));
    } catch (e) { return erroAdmin(e); }
  },

  async adminDashboard(req: NextRequest) {
    try {
      const id_solicitante = getIdSolicitante(req);
      if (!id_solicitante) return NextResponse.json({ erro: 'Informe id_solicitante' }, { status: 400 });
      return NextResponse.json(await adminService.resumoDashboard(id_solicitante));
    } catch (e) { return erroAdmin(e); }
  },

  async adminTicketsPendentes(req: NextRequest) {
    try {
      const id_solicitante = getIdSolicitante(req);
      if (!id_solicitante) return NextResponse.json({ erro: 'Informe id_solicitante' }, { status: 400 });
      return NextResponse.json(await adminService.listarTicketsPendentes(id_solicitante));
    } catch (e) { return erroAdmin(e); }
  },

  // ─── Admin: gestão de usuários ───────────────────────────────────────────────

  async adminCriarUsuario(req: NextRequest) {
    try {
      const id_solicitante = getIdSolicitante(req);
      if (!id_solicitante) return NextResponse.json({ erro: 'Informe id_solicitante' }, { status: 400 });
      const body = await req.json();
      const id = await adminService.criarUsuario(id_solicitante, body);
      return NextResponse.json({ id_usuario: id, mensagem: 'Usuário criado pelo admin' }, { status: 201 });
    } catch (e) { return erroAdmin(e); }
  },

  async adminDesativarUsuario(id_alvo: number, req: NextRequest) {
    try {
      const id_solicitante = getIdSolicitante(req);
      if (!id_solicitante) return NextResponse.json({ erro: 'Informe id_solicitante' }, { status: 400 });
      await adminService.desativarUsuario(id_solicitante, id_alvo);
      return NextResponse.json({ mensagem: 'Usuário desativado (soft delete)' });
    } catch (e) { return erroAdmin(e); }
  },

  async adminReativarUsuario(id_alvo: number, req: NextRequest) {
    try {
      const id_solicitante = getIdSolicitante(req);
      if (!id_solicitante) return NextResponse.json({ erro: 'Informe id_solicitante' }, { status: 400 });
      await adminService.reativarUsuario(id_solicitante, id_alvo);
      return NextResponse.json({ mensagem: 'Usuário reativado com sucesso' });
    } catch (e) { return erroAdmin(e); }
  },
};