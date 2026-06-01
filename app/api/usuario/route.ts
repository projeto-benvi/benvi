import { usuarioController } from '@/controller/usuarioController';
import { NextRequest } from 'next/server';

export async function GET() {
  return usuarioController.listar();
}

export async function POST(req: NextRequest) {
  return usuarioController.criar(req);
}