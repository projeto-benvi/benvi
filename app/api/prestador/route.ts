import { prestadorController } from '@/controller/prestadorController';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return prestadorController.listar(req);
}

export async function POST(req: NextRequest) {
  return prestadorController.criar(req);
}