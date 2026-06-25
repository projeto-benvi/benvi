import { servicoController } from '@/controller/servicoController'; 
import { NextRequest } from 'next/server';

// GET /api/servicos?id_prestador=123
export async function GET(req: NextRequest) {
  return await servicoController.listar(req);
}

// POST /api/servicos
export async function POST(req: NextRequest) {
  return await servicoController.criar(req);
}