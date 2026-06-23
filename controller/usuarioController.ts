import { usuarioService } from '@/service/usuarioService';
import { adminService } from '@/service/usuarioService';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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
  } catch (e: any) {
    return NextResponse.json({ 
      erro: 'Erro ao criar usuário', 
      detalhes: e?.message || String(e)  // ← manda mensagem limpa
    }, { status: 500 });
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
      let nome, telefone, cidade, estado, sobreVoce, dataNascimentoString;
      let is_admin = undefined;
      let avatarFile = null;
      let avatarUrl = undefined;

      // 1. Detecta dinamicamente o tipo de requisição (JSON ou FormData)
      const contentType = req.headers.get("content-type") || "";

      if (contentType.includes("multipart/form-data")) {
        // Se vier do Front-end (com ou sem foto de perfil)
        const data = await req.formData();
        nome = data.get("nome")?.toString();
        telefone = data.get("telefone")?.toString();
        cidade = data.get("cidade")?.toString();
        estado = data.get("estado")?.toString();
        sobreVoce = data.get("sobreVoce")?.toString();
        dataNascimentoString = data.get("dataNascimento")?.toString();
        
        const adminCheck = data.get("is_admin");
        if (adminCheck !== null && adminCheck !== undefined) {
          is_admin = adminCheck.toString() === "true" || adminCheck.toString() === "1";
        }
        
        avatarFile = data.get("avatar") as File | null;
      } else {
        // Se vier do Thunder Client como JSON puro (Ex: {"is_admin": true})
        const body = await req.json();
        nome = body.nome;
        telefone = body.telefone;
        cidade = body.cidade;
        estado = body.estado;
        sobreVoce = body.sobreVoce;
        dataNascimentoString = body.dataNascimento;
        is_admin = body.is_admin;
      }

      // 2. Lógica de salvamento físico da foto (mantida exatamente como você criou)
      if (avatarFile && avatarFile.size > 0) {
        const bytes = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const extensao = avatarFile.name.split('.').pop();
        const nomeArquivo = `avatar-${id}-${Date.now()}.${extensao}`;
        
        const caminhoDiretorio = path.join(process.cwd(), 'public', 'uploads');
        
        try {
          await mkdir(caminhoDiretorio, { recursive: true });
        } catch (err) {}

        const caminhoCompleto = path.join(caminhoDiretorio, nomeArquivo);
        await writeFile(caminhoCompleto, buffer);
        avatarUrl = `/uploads/${nomeArquivo}`;
      }

      // 3. Monta dinamicamente os campos que realmente foram enviados para atualizar
      const dadosParaAtualizar: any = {};
      if (nome !== undefined) dadosParaAtualizar.nome = nome;
      if (telefone !== undefined) dadosParaAtualizar.telefone = telefone;
      if (cidade !== undefined) dadosParaAtualizar.cidade = cidade;
      if (estado !== undefined) dadosParaAtualizar.estado = estado;
      if (sobreVoce !== undefined) dadosParaAtualizar.sobreVoce = sobreVoce;
      if (is_admin !== undefined) dadosParaAtualizar.is_admin = is_admin; // <-- Crucial para o seu teste
      if (dataNascimentoString) dadosParaAtualizar.dataNascimento = new Date(dataNascimentoString);
      if (avatarUrl) dadosParaAtualizar.avatar = avatarUrl;

      // Executa a query no banco através do seu service
      await usuarioService.atualizar(id, dadosParaAtualizar);
      
      return NextResponse.json({ 
        sucesso: true, 
        mensagem: 'Atualizado com sucesso',
        avatar: avatarUrl,
        dadosAtualizados: dadosParaAtualizar
      });
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