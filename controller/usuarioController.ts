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

  // SALVAMENTO REAL DA FOTO LOCALMENTE CONFIGURADO AQUI:
  async atualizar(id: number, req: NextRequest) {
    try {
      const data = await req.formData();

      const nome = data.get("nome")?.toString();
      const telefone = data.get("telefone")?.toString();
      const cidade = data.get("cidade")?.toString();
      const estado = data.get("estado")?.toString();
      const sobreVoce = data.get("sobreVoce")?.toString();
      const dataNascimentoString = data.get("dataNascimento")?.toString();

      const avatarFile = data.get("avatar") as File | null;
      let avatarUrl = undefined;

      // Se o usuário enviou um arquivo de imagem
      if (avatarFile && avatarFile.size > 0) {
        const bytes = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Gera um nome único para o arquivo evitar conflitos de cache
        const extensao = avatarFile.name.split('.').pop();
        const nomeArquivo = `avatar-${id}-${Date.now()}.${extensao}`;
        
        // Caminho da pasta public/uploads
        const caminhoDiretorio = path.join(process.cwd(), 'public', 'uploads');
        
        // Garante que a pasta 'uploads' existe antes de salvar
        try {
          await mkdir(caminhoDiretorio, { recursive: true });
        } catch (err) {
          // Pasta já existe ou erro ignorável
        }

        const caminhoCompleto = path.join(caminhoDiretorio, nomeArquivo);

        // Escreve o arquivo fisicamente no disco do seu computador
        await writeFile(caminhoCompleto, buffer);

        // Esta é a URL pública que o navegador lerá (aponta para public/uploads/...)
        avatarUrl = `/uploads/${nomeArquivo}`;
      }

      const dadosParaAtualizar: any = {
        nome,
        telefone,
        cidade,
        estado,
        sobreVoce,
        dataNascimento: dataNascimentoString ? new Date(dataNascimentoString) : undefined,
      };

      // Se gerou um link de imagem, repassa para salvar na coluna foto_perfil do banco
      if (avatarUrl) {
        dadosParaAtualizar.avatar = avatarUrl;
      }

      await usuarioService.atualizar(id, dadosParaAtualizar);
      
      return NextResponse.json({ 
        sucesso: true, 
        mensagem: 'Atualizado com sucesso',
        avatar: avatarUrl // Devolve o link para o front-end atualizar a tela na hora
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