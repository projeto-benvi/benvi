import { usuarioService } from '@/service/usuarioService';
import { adminService } from '@/service/usuarioService';
import { NextRequest, NextResponse } from 'next/server';
import { storageErrorStatus, uploadPublicImage } from '@/app/lib/storage';
import { somenteDigitos, validarCPF } from '@/app/lib/cpf';

// Helper para extrair id_solicitante e retornar erro padronizado
function getIdSolicitante(req: NextRequest, idAutenticado?: number): number | null {
  const id = idAutenticado ?? Number(new URL(req.url).searchParams.get('id_solicitante'));
  return isNaN(id) || id === 0 ? null : id;
}

function erroAdmin(e: unknown) {
  const msg = String(e);
  const status = msg.includes('Acesso negado') ? 403
               : msg.includes('não encontrado') ? 404
               : 400;
  return NextResponse.json({ erro: msg }, { status });
}

function logErroAtualizacaoUsuario(error: unknown, contexto: Record<string, unknown>) {
  const erro = error as { name?: string; code?: string; message?: string; stack?: string };

  console.error('Erro ao atualizar usuário.', {
    tipo: erro?.name ?? typeof error,
    codigo: erro?.code,
    mensagem: erro?.message,
    ...contexto,
  });
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
    if (!body?.nome || !body?.email || !body?.senha || !body?.cpf) {
      return NextResponse.json({ erro: 'Nome, e-mail, CPF e senha são obrigatórios.' }, { status: 400 });
    }
    if (!validarCPF(String(body.cpf))) {
      return NextResponse.json({ erro: 'Informe um CPF válido.', campo: 'cpf' }, { status: 400 });
    }
    body.cpf = somenteDigitos(String(body.cpf));
    const id = await usuarioService.criar(body);
    return NextResponse.json({ id_usuario: id }, { status: 201 });
  } catch (e: any) {
    const codigo = e?.code;
    const status = codigo === 'ER_DUP_ENTRY' ? 409 : 500;

    return NextResponse.json({
      erro: codigo === 'ER_DUP_ENTRY' ? 'Já existe uma conta com esses dados.' : 'Erro ao criar usuário',
    }, { status });
  }
},

  async buscarPorId(id: number) {
    try {
      const usuario = await usuarioService.buscarPorId(id);
      if (!usuario) return NextResponse.json({ erro: 'Usuário não encontrado' }, { status: 404 });
      return NextResponse.json(usuario);
    } catch {
      return NextResponse.json({ erro: 'Erro ao buscar usuário' }, { status: 500 });
    }
  },

  async atualizar(id: number, req: NextRequest) {
    let camposRecebidos: string[] = [];
    let camposNormalizados: string[] = [];
    const contentType = req.headers.get("content-type") || "";

    try {
      let nome, telefone, cidade, estado, sobreVoce, dataNascimentoString, cpf;
      let avatarFile = null;
      let avatarUrl = undefined;

      // 1. Detecta dinamicamente o tipo de requisição (JSON ou FormData)
      if (contentType.includes("multipart/form-data")) {
        // Se vier do Front-end (com ou sem foto de perfil)
        const data = await req.formData();
        camposRecebidos = Array.from(new Set(Array.from(data.keys())));
        nome = data.get("nome")?.toString();
        telefone = data.get("telefone")?.toString();
        cidade = data.get("cidade")?.toString();
        estado = data.get("estado")?.toString();
        sobreVoce = data.get("sobreVoce")?.toString();
        dataNascimentoString = data.get("dataNascimento")?.toString();
        cpf = data.get("cpf")?.toString();
        avatarFile = data.get("avatar") as File | null;
      } else {
        const body = await req.json();
        camposRecebidos = Object.keys(body ?? {});
        nome = body.nome;
        telefone = body.telefone;
        cidade = body.cidade;
        estado = body.estado;
        sobreVoce = body.sobreVoce;
        dataNascimentoString = body.dataNascimento;
        cpf = body.cpf;
      }

      if (cpf !== undefined && !validarCPF(String(cpf))) {
        return NextResponse.json({ erro: 'Informe um CPF válido.', campo: 'cpf' }, { status: 400 });
      }

      if (avatarFile && avatarFile.size > 0) {
        const upload = await uploadPublicImage({
          file: avatarFile,
          folder: 'avatars',
        });
        avatarUrl = upload.url;
      }

      // 3. Monta dinamicamente os campos que realmente foram enviados para atualizar
      const dadosParaAtualizar: any = {};
      if (nome !== undefined) dadosParaAtualizar.nome = nome;
      if (telefone !== undefined) dadosParaAtualizar.telefone = telefone;
      if (cidade !== undefined) dadosParaAtualizar.cidade = cidade;
      if (estado !== undefined) dadosParaAtualizar.estado = estado;
      if (sobreVoce !== undefined) dadosParaAtualizar.sobreVoce = sobreVoce;
      if (cpf !== undefined) dadosParaAtualizar.cpf = somenteDigitos(String(cpf));
      // Campo administrativo: nunca pode ser alterado pela rota comum de perfil.
      if (dataNascimentoString) dadosParaAtualizar.dataNascimento = new Date(dataNascimentoString);
      if (avatarUrl) dadosParaAtualizar.avatar = avatarUrl;
      camposNormalizados = Object.keys(dadosParaAtualizar);

      // Executa a query no banco através do seu service
      await usuarioService.atualizar(id, dadosParaAtualizar);
      
      return NextResponse.json({ 
        sucesso: true, 
        mensagem: 'Atualizado com sucesso',
        avatar: avatarUrl,
        dadosAtualizados: dadosParaAtualizar
      });
    } catch (e) {
      logErroAtualizacaoUsuario(e, {
        idUsuario: id,
        contentType,
        camposRecebidos,
        camposNormalizados,
      });
      return NextResponse.json(
        { erro: 'Erro ao atualizar usuário' },
        { status: storageErrorStatus(e) }
      );
    }
  },

  async deletar(id: number) {
    try {
      await usuarioService.deletar(id);
      return NextResponse.json({ mensagem: 'Deletado com sucesso' });
    } catch {
      return NextResponse.json({ erro: 'Erro ao deletar usuário' }, { status: 500 });
    }
  },

  // ─── Admin: leitura / dashboard ─────────────────────────────────────────────

  async adminContarUsuarios(req: NextRequest, idAutenticado?: number) {
    try {
      const id_solicitante = getIdSolicitante(req, idAutenticado);
      if (!id_solicitante) return NextResponse.json({ erro: 'Informe id_solicitante' }, { status: 400 });
      return NextResponse.json(await adminService.contarUsuarios(id_solicitante));
    } catch (e) { return erroAdmin(e); }
  },

  async adminListarUsuarios(req: NextRequest, idAutenticado?: number) {
    try {
      const id_solicitante = getIdSolicitante(req, idAutenticado);
      if (!id_solicitante) return NextResponse.json({ erro: 'Informe id_solicitante' }, { status: 400 });
      return NextResponse.json(await adminService.listarTodosUsuarios(id_solicitante));
    } catch (e) { return erroAdmin(e); }
  },

  async adminListarPrestadores(req: NextRequest, idAutenticado?: number) {
    try {
      const id_solicitante = getIdSolicitante(req, idAutenticado);
      if (!id_solicitante) return NextResponse.json({ erro: 'Informe id_solicitante' }, { status: 400 });
      return NextResponse.json(await adminService.listarTodosPrestadores(id_solicitante));
    } catch (e) { return erroAdmin(e); }
  },

  async adminDashboard(req: NextRequest, idAutenticado?: number) {
    try {
      const id_solicitante = getIdSolicitante(req, idAutenticado);
      if (!id_solicitante) return NextResponse.json({ erro: 'Informe id_solicitante' }, { status: 400 });
      return NextResponse.json(await adminService.resumoDashboard(id_solicitante));
    } catch (e) { return erroAdmin(e); }
  },

  async adminTicketsPendentes(req: NextRequest, idAutenticado?: number) {
    try {
      const id_solicitante = getIdSolicitante(req, idAutenticado);
      if (!id_solicitante) return NextResponse.json({ erro: 'Informe id_solicitante' }, { status: 400 });
      return NextResponse.json(await adminService.listarTicketsPendentes(id_solicitante));
    } catch (e) { return erroAdmin(e); }
  },

  // ─── Admin: gestão de usuários ───────────────────────────────────────────────

  async adminCriarUsuario(req: NextRequest, idAutenticado?: number) {
    try {
      const id_solicitante = getIdSolicitante(req, idAutenticado);
      if (!id_solicitante) return NextResponse.json({ erro: 'Informe id_solicitante' }, { status: 400 });
      const body = await req.json();
      const id = await adminService.criarUsuario(id_solicitante, body);
      return NextResponse.json({ id_usuario: id, mensagem: 'Usuário criado pelo admin' }, { status: 201 });
    } catch (e) { return erroAdmin(e); }
  },

  async adminDesativarUsuario(id_alvo: number, req: NextRequest, idAutenticado?: number) {
    try {
      const id_solicitante = getIdSolicitante(req, idAutenticado);
      if (!id_solicitante) return NextResponse.json({ erro: 'Informe id_solicitante' }, { status: 400 });
      await adminService.desativarUsuario(id_solicitante, id_alvo);
      return NextResponse.json({ mensagem: 'Usuário desativado (soft delete)' });
    } catch (e) { return erroAdmin(e); }
  },

  async adminReativarUsuario(id_alvo: number, req: NextRequest, idAutenticado?: number) {
    try {
      const id_solicitante = getIdSolicitante(req, idAutenticado);
      if (!id_solicitante) return NextResponse.json({ erro: 'Informe id_solicitante' }, { status: 400 });
      await adminService.reativarUsuario(id_solicitante, id_alvo);
      return NextResponse.json({ mensagem: 'Usuário reativado com sucesso' });
    } catch (e) { return erroAdmin(e); }
  },
};
