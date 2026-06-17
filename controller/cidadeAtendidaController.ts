import { cidadeAtendidaService } from '@/service/cidadeAtendidaService';
import { NextResponse, NextRequest } from 'next/server';

export const cidadeAtendidaController = {
  async criar(req: NextRequest) {
    try {
      const body = await req.json();
      const { id_parceria, cidade, estado, acesso_gratuito } = body;

      if (!id_parceria || !cidade || !estado || acesso_gratuito === undefined) {
        return NextResponse.json({ erro: 'Campos obrigatórios ausentes' }, { status: 400 });
      }

      const novaCidade = await cidadeAtendidaService.criar({ id_parceria, cidade, estado, acesso_gratuito });
      return NextResponse.json(novaCidade, { status: 201 });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao registar cidade', detalhes: String(e) }, { status: 500 });
    }
  },

  async listar() {
    try {
      const cidades = await cidadeAtendidaService.listarTodas();
      return NextResponse.json(cidades);
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao listar cidades', detalhes: String(e) }, { status: 500 });
    }
  },

  async buscarPorId(id: number) {
    try {
      const cidade = await cidadeAtendidaService.buscarPorId(id);
      if (!cidade) {
        return NextResponse.json({ erro: 'Cidade não encontrada' }, { status: 404 });
      }
      return NextResponse.json(cidade);
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao buscar cidade', detalhes: String(e) }, { status: 500 });
    }
  },

  async atualizar(id: number, req: NextRequest) {
    try {
      const body = await req.json();
      const { id_parceria, cidade, estado, acesso_gratuito } = body;

      if (!id_parceria || !cidade || !estado || acesso_gratuito === undefined) {
        return NextResponse.json({ erro: 'Campos obrigatórios ausentes' }, { status: 400 });
      }

      const atualizado = await cidadeAtendidaService.atualizar(id, { id_parceria, cidade, estado, acesso_gratuito });
      if (!atualizado) {
        return NextResponse.json({ erro: 'Cidade não encontrada para atualização' }, { status: 404 });
      }

      return NextResponse.json({ mensagem: 'Cidade atualizada com sucesso' });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao atualizar cidade', detalhes: String(e) }, { status: 500 });
    }
  },

  async deletar(id: number) {
    try {
      const deletado = await cidadeAtendidaService.deletar(id);
      if (!deletado) {
        return NextResponse.json({ erro: 'Cidade não encontrada para exclusão' }, { status: 404 });
      }
      return NextResponse.json({ mensagem: 'Cidade eliminada com sucesso' });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao eliminar cidade', detalhes: String(e) }, { status: 500 });
    }
  }
};