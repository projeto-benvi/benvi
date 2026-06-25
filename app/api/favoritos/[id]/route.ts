import { favoritoController } from '@/controller/favoritoController';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = Number(id);

  if (Number.isNaN(idNum)) {
    return NextResponse.json({ erro: 'ID inválido.' }, { status: 400 });
  }

  return favoritoController.buscarPorId(idNum);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = Number(id);

  if (Number.isNaN(idNum)) {
    return NextResponse.json({ erro: 'ID inválido.' }, { status: 400 });
  }

  return favoritoController.deletarPorId(idNum);
}
