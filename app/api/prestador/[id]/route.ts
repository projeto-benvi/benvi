import { NextRequest, NextResponse } from 'next/server';
import { prestadorController } from '@/controller/prestadorController';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);

    if (isNaN(idNum)) {
      return NextResponse.json({ erro: 'ID inválido' }, { status: 400 });
    }

    // Chama o controller
    const prestador = await prestadorController.buscarPorId(idNum);

    if (!prestador) {
      return NextResponse.json({ erro: 'Prestador não encontrado' }, { status: 404 });
    }

    return NextResponse.json(prestador);
  } catch (error) {
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = parseInt(id);
  if (isNaN(idNum)) {
    return Response.json({ erro: 'ID inválido' }, { status: 400 });
  }
  return prestadorController.atualizar(idNum, req);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = parseInt(id);
  if (isNaN(idNum)) {
    return Response.json({ erro: 'ID inválido' }, { status: 400 });
  }
  return prestadorController.deletar(idNum);
}