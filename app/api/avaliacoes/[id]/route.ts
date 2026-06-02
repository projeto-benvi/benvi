import { NextResponse } from 'next/server';
import { AvaliacaoController } from '@/controller/avaliacaoController';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  try {

    const { id } = await params;

    const avaliacao =
      await AvaliacaoController.buscarPorId(
        Number(id)
      );

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