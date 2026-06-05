import { prestadorController } from '@/controller/prestadorController';
import { NextRequest } from 'next/server';

export async function GET() {
  return prestadorController.listar();
}

export async function POST(req: NextRequest) {
  return prestadorController.criar(req);
}