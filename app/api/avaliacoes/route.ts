import { NextResponse } from 'next/server';
import { AvaliacaoController } from '@/controller/avaliacaoController';

export async function GET() {

  try {

    const avaliacoes =
      await AvaliacaoController.listar();

    return NextResponse.json(
      avaliacoes,
      { status: 200 }
    );

  } catch {

    return NextResponse.json(
      { error: 'Erro ao buscar avaliações' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {

  try {

    const body = await request.json();

    const dadosAvaliacao = {
      id_usuario: body.id_usuario,
      id_prestador: body.id_prestador,
      id_servico: body.id_servico,
      nota: body.nota_geral ?? body.nota ?? 5,
      comentario: body.comentario || '',
      comunicacao: body.comunicacao ?? body.custo_beneficio ?? 5,
      respeito: body.respeito ?? body.atendimento ?? 5,
      pontualidade: body.pontualidade ?? 5,
      acordo: body.acordo ?? body.qualidade_servico ?? 5,
    };

    const id =
      await AvaliacaoController.criar(
        dadosAvaliacao.id_usuario,
        dadosAvaliacao.id_prestador,
        dadosAvaliacao.id_servico,
        dadosAvaliacao.nota,
        dadosAvaliacao.comentario,
        dadosAvaliacao.comunicacao,
        dadosAvaliacao.respeito,
        dadosAvaliacao.pontualidade,
        dadosAvaliacao.acordo
      );

    return NextResponse.json(
      {
        id_avaliacao: id,
        message: 'Avaliação criada com sucesso'
      },
      { status: 201 }
    );

  } catch (error) {

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Erro interno'
      },
      { status: 400 }
    );
  }
}