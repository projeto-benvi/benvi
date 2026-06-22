import { favoritoController } from '@/controller/favoritoController';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return favoritoController.listar(req);
}

export async function POST(req: NextRequest) {
  return favoritoController.criar(req);
}

export async function DELETE(req: NextRequest) {
  return favoritoController.deletarPorUsuarioPrestador(req);
}
