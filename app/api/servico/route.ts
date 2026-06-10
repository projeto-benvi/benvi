import { servicoController } from '@/controller/servicoController'; 
import { NextRequest } from 'next/server';

// GET /api/servicos
export async function GET() {
  return await servicoController.listar();
}

// POST /api/servicos
export async function POST(req: NextRequest) {
  return await servicoController.criar(req);
}