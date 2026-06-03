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

    const id =
      await AvaliacaoController.criar(
        body.nota,
        body.comentario || ''
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