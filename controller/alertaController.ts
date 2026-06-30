import { alertaService } from '@/service/alertaService';
import { notificacaoService } from '@/service/notificacaoService';
import { NextResponse, NextRequest } from 'next/server';

export const alertaController = {
  async criar(req: NextRequest) {
    try {
      const body = await req.json();
      const { id_usuario, id_notificacao, titulo, descricao, prioridade, categoria, url_acao, data_expiracao, status } = body;

      if (id_notificacao && prioridade !== undefined && categoria) {
        const novoAlertaLegado = await alertaService.criar({
          id_notificacao: Number(id_notificacao),
          prioridade: Number(prioridade),
          categoria,
          status: status || 'ativo',
          url_acao,
          data_expiracao: data_expiracao ? new Date(data_expiracao) : undefined,
        });
        return NextResponse.json(novoAlertaLegado, { status: 201 });
      }

      if (!id_usuario || !titulo || !descricao || prioridade === undefined || !categoria) {
        return NextResponse.json(
          { erro: 'Campos obrigatórios ausentes (id_usuario, titulo, descricao, prioridade ou categoria)' },
          { status: 400 }
        );
      }

      const novaNotificacao = await notificacaoService.criar({
        id_usuario: Number(id_usuario),
        titulo,
        descricao,
        url_acao: url_acao || '/alerta',
        tipo: 'alerta',
      });

      const novoAlerta = await alertaService.criar({
        id_notificacao: novaNotificacao.id_notificacao,
        prioridade: Number(prioridade),
        categoria,
        status: status || 'ativo',
        url_acao,
        data_expiracao: data_expiracao ? new Date(data_expiracao) : undefined,
      });

      return NextResponse.json({ ...novoAlerta, notificacao: novaNotificacao }, { status: 201 });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao criar alerta', detalhes: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
  },

  async listar(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const alertas = await alertaService.listar({
        id_usuario: searchParams.get('id_usuario') ? Number(searchParams.get('id_usuario')) : undefined,
        status: searchParams.get('status') || undefined,
        prioridade: searchParams.get('prioridade') ? Number(searchParams.get('prioridade')) : undefined,
        categoria: searchParams.get('categoria') || undefined,
        inicio: searchParams.get('inicio') || undefined,
        fim: searchParams.get('fim') || undefined,
      });
      return NextResponse.json(alertas);
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao listar alertas', detalhes: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
  },

  async listarAtivos() {
    try {
      const alertas = await alertaService.listarAtivos();
      return NextResponse.json(alertas);
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao listar alertas', detalhes: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
  },

  async buscarPorId(id: number) {
    try {
      const alerta = await alertaService.buscarPorId(id);
      if (!alerta) return NextResponse.json({ erro: 'Alerta não encontrado' }, { status: 404 });
      return NextResponse.json(alerta);
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao buscar alerta', detalhes: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
  },

  async atualizar(id: number, req: NextRequest) {
    try {
      const body = await req.json();
      const atualizado = await alertaService.atualizar(id, body);
      if (!atualizado) return NextResponse.json({ erro: 'Alerta não encontrado ou sem alterações' }, { status: 404 });
      return NextResponse.json({ mensagem: 'Alerta atualizado com sucesso' });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao atualizar alerta', detalhes: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
  },

  async deletar(id: number) {
    try {
      const deletado = await alertaService.deletar(id);
      if (!deletado) return NextResponse.json({ erro: 'Alerta não encontrado para exclusão' }, { status: 404 });
      return NextResponse.json({ mensagem: 'Alerta deletado com sucesso' });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao deletar alerta', detalhes: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
  }
};
