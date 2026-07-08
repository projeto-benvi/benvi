import { NextResponse } from 'next/server';
import { NotificacaoServico } from '@/model/notificacaoServico';
import { criarNotificacaoServico, listarNotificacoes } from '@/service/notificacaoServicoService';
import { notificacaoService } from '@/service/notificacaoService';

export class NotificacaoServicoController {
  
  async handleCriar(request: Request) {
    try {
      const body = await request.json();
      const { id_notificacao_fk, id_usuario, descricao, valor_estimado } = body;

      if (!id_usuario || !descricao) {
        return NextResponse.json(
          { error: 'Campos obrigatórios (id_usuario, descricao) não informados.' },
          { status: 400 }
        );
      }

      const novaNotificacao = new NotificacaoServico({
        id_notificacao_fk: id_notificacao_fk || null,
        id_usuario,
        descricao,
        valor_estimado
      });

      const resultado = await criarNotificacaoServico(novaNotificacao);

      // Gera notificação automática para o usuário
      await notificacaoService.criar({
        id_usuario,
        titulo: 'Solicitação de serviço recebida',
        descricao: `Sua solicitação foi registrada: "${descricao}"`,
      });

      return NextResponse.json(
        { message: 'Notificação de serviço cadastrada com sucesso!', data: resultado },
        { status: 201 }
      );

    } catch (error: any) {
      console.error('Erro no handleCriar:', error);
      return NextResponse.json(
        { error: 'Erro interno no servidor.' },
        { status: 500 }
      );
    }
  }

  async handleListar() {
    try {
      const notificacoes = await listarNotificacoes();
      return NextResponse.json(notificacoes, { status: 200 });
    } catch (error: any) {
      console.error('Erro no handleListar:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar notificações de serviço.' },
        { status: 500 }
      );
    }
  }
}