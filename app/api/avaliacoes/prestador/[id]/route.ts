import { NextResponse } from 'next/server';
import { AvaliacaoController } from '@/controller/avaliacaoController';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idPrestador = Number(id);

    if (!Number.isFinite(idPrestador) || idPrestador <= 0) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const avaliacoes =
      await AvaliacaoController.listarPorPrestador(
        idPrestador
      );

    return NextResponse.json(
      avaliacoes,
      { status: 200 }
    );

  } catch {
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}