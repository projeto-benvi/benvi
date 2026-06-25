import { NextResponse } from 'next/server';
import { AvaliacaoController } from '@/controller/avaliacaoController';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const idAvaliacao = await AvaliacaoController.criar(
      Number(body.id_usuario ?? id),
      Number(body.id_prestador ?? body.idPrestador ?? body.prestadorId),
      Number(body.id_servico),
      Number(body.nota_geral ?? body.nota ?? 5),
      body.comentario || '',
      Number(body.comunicacao ?? 5),
      Number(body.respeito ?? 5),
      Number(body.pontualidade ?? 5),
      Number(body.acordo ?? 5)
    );

    return NextResponse.json(
      { id_avaliacao: idAvaliacao, message: 'Avaliação criada com sucesso' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro interno'
      },
      { status: 400 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  try {

    const { id } = await params;

    const avaliacoes = await AvaliacaoController.listar();
    const avaliacao = await AvaliacaoController.buscarPorId(Number(id)

  );

    if (!avaliacao) {
      return NextResponse.json(
        { error: 'Avaliação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      avaliacao,
      { status: 200 }
    );

  } catch (error) {

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Erro interno'
      },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  try {

    const { id } = await params;

    const body = await request.json();
    
    await AvaliacaoController.atualizar(
      Number(id),
      body.nota,
      body.comentario
    );

    return NextResponse.json(
      {
        message: 'Avaliação atualizada'
      },
      { status: 200 }
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  try {

    const { id } = await params;

    await AvaliacaoController.remover(
      Number(id)
    );

    return NextResponse.json(
      {
        message: 'Avaliação removida'
      },
      { status: 200 }
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