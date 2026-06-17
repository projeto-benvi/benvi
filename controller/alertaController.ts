import { alertaService } from '@/service/alertaService';
import { NextResponse, NextRequest } from 'next/server';

export const alertaController = {
  async criar(req: NextRequest) {
    try {
      const body = await req.json();
      const { id_notificacao, prioridade, categoria, url_acao, data_expiracao } = body;

      if (!id_notificacao || prioridade === undefined || !categoria) {
        return NextResponse.json({ erro: 'Campos obrigatórios ausentes' }, { status: 400 });
      }

      const novoAlerta = await alertaService.criar({
        id_notificacao,
        prioridade,
        categoria,
        url_acao,
        data_expiracao
      });

      return NextResponse.json(novoAlerta, { status: 201 });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao criar alerta', detalhes: String(e) }, { status: 500 });
    }
  },

  async listarAtivos() {
    try {
      const alertas = await alertaService.listarAtivos();
      return NextResponse.json(alertas);
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao listar alertas', detalhes: String(e) }, { status: 500 });
    }
  },

  async buscarPorId(id: number) {
    try {
      const alerta = await alertaService.buscarPorId(id);
      if (!alerta) {
        return NextResponse.json({ erro: 'Alerta não encontrado' }, { status: 404 });
      }
      return NextResponse.json(alerta);
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao buscar alerta', detalhes: String(e) }, { status: 500 });
    }
  },

  async deletar(id: number) {
    try {
      const deletado = await alertaService.deletar(id);
      if (!deletado) {
        return NextResponse.json({ erro: 'Alerta não encontrado para exclusão' }, { status: 404 });
      }
      return NextResponse.json({ mensagem: 'Alerta deletado com sucesso' });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao deletar alerta', detalhes: String(e) }, { status: 500 });
    }
  }
};