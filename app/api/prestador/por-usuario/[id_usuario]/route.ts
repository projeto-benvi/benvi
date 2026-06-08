import { prestadorController } from '@/controller/prestadorController';
import { NextRequest } from 'next/server';

export async function GET(
  _: NextRequest,
  { params }: { params: { id_usuario: string } }
) {
  return prestadorController.buscarPorIdUsuario(Number(params.id_usuario));
}