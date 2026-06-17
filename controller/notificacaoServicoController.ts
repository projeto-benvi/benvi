import { NextResponse } from 'next/server';
import { NotificacaoServico } from '@/model/notificacaoServico';
// 1. AJUSTADO: Importando também o listarNotificacoes do seu service
import { criarNotificacaoServico, listarNotificacoes } from '@/service/notificacaoServicoService';

export class NotificacaoServicoController {
  
  // Seu método de criar atual (continua igual)
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

      return NextResponse.json(
        { message: 'Notificação de serviço cadastrada com sucesso!', data: resultado },
        { status: 201 }
      );

    } catch (error: any) {
      console.error('Erro no handleCriar:', error);
      return NextResponse.json(
        { error: 'Erro interno no servidor.', detalhes: error.message },
        { status: 500 }
      );
    }
  }

  // 2. ADICIONADO: O método que estava faltando para sua rota GET funcionar!
  async handleListar() {
    try {
      const notificacoes = await listarNotificacoes();
      return NextResponse.json(notificacoes, { status: 200 });
    } catch (error: any) {
      console.error('Erro no handleListar:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar notificações de serviço.', detalhes: error.message },
        { status: 500 }
      );
    }
  }
}