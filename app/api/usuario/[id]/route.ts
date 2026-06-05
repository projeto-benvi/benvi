import { usuarioController } from '@/controller/usuarioController';
import { NextRequest } from 'next/server';

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  return usuarioController.buscarPorId(Number(params.id));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return usuarioController.atualizar(Number(params.id), req);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  return usuarioController.deletar(Number(params.id));
}