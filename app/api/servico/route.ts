import { servicoController } from '@/controller/servicoController'; 
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireUser } from '@/app/lib/authz';

// GET /api/servicos?id_prestador=123
export async function GET(req: NextRequest) {
  return await servicoController.listar(req);
}

// POST /api/servicos
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    return await servicoController.criar(req, user.id);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao criar servico.' }, { status: 500 });
  }
}
