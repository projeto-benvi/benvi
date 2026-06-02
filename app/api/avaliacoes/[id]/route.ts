import { NextResponse } from 'next/server';
import { AvaliacaoController } from '@/controller/avaliacaoController';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  try {

    const { id } = await params;

    const avaliacoes = await AvaliacaoController.listar();
    const avaliacao = avaliacoes.find((a: any) => a.id === Number(id));

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

    await AvaliacaoController.criar(
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