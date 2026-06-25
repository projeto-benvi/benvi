import { NextResponse } from 'next/server';
import { AvaliacaoController } from '@/controller/avaliacaoController';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params;
    
    console.log("ID recebido:", id);


    const avaliacoes =
      await AvaliacaoController.listarPorPrestador(
        Number(id)
      );

    return NextResponse.json(
      avaliacoes,
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
      { status: 500 }
    );

  }
  
}