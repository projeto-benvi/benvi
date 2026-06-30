import { alertaController } from '@/controller/alertaController';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return alertaController.criar(req);
}

export async function GET(req: NextRequest) {
  return alertaController.listar(req);
}
