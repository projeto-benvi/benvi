import { cidadeAtendidaController } from '@/controller/cidadeAtendidaController';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return cidadeAtendidaController.criar(req);
}

export async function GET() {
  return cidadeAtendidaController.listar();
}