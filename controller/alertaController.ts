/*
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
*/
import { alertaService } from '@/service/alertaService';
// Importe o serviço responsável por criar registros na tabela NOTIFICACAO
import { notificacaoService } from '@/service/notificacaoService'; 
import { NextResponse, NextRequest } from 'next/server';

export const alertaController = {
  async criar(req: NextRequest) {
    try {
      const body = await req.json();
      
      // Recebemos os dados da Notificação (id_usuario, titulo, descricao) 
      // e os dados do Alerta (prioridade, categoria, url_acao, data_expiracao)
      const { 
        id_usuario, 
        titulo, 
        descricao, 
        prioridade, 
        categoria, 
        url_acao, 
        data_expiracao 
      } = body;

      // Validação dos campos cruciais para ambas as tabelas
      if (!id_usuario || !titulo || !descricao || prioridade === undefined || !categoria) {
        return NextResponse.json({ erro: 'Campos obrigatórios ausentes (id_usuario, titulo, descricao, prioridade ou categoria)' }, { status: 400 });
      }

      // 1️⃣ PASSO: Criar a Notificação para o usuário específico primeiro
      // Isso vai gerar o id_notificacao real que o banco precisa
      const novaNotificacao = await notificacaoService.criar({
        id_usuario: Number(id_usuario),
        titulo,
        descricao,
      });

      // 2️⃣ PASSO: Criar o Alerta usando o ID gerado no passo anterior
      const novoAlerta = await alertaService.criar({
        id_notificacao: novaNotificacao.id_notificacao, // Vincula o ID real gerado
        prioridade: Number(prioridade),
        categoria,
        url_acao,
        data_expiracao: data_expiracao ? new Date(data_expiracao) : undefined
      });

      // Retorna o alerta criado com sucesso
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