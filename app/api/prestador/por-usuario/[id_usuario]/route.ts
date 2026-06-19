import { prestadorController } from '@/controller/prestadorController';
import { NextRequest } from 'next/server';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id_usuario: string }> }
) {
  const { id_usuario } = await params;
  return prestadorController.buscarPorIdUsuario(Number(id_usuario));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id_usuario: string }> }
) {
  const { id_usuario } = await params;
  return prestadorController.atualizarPorIdUsuario(Number(id_usuario), req);
}