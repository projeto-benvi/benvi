import { cidadeAtendidaController } from '@/controller/cidadeAtendidaController';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireAdmin } from '@/app/lib/authz';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    return cidadeAtendidaController.criar(req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao criar cidade atendida.' }, { status: 500 });
  }
}

export async function GET() {
  return cidadeAtendidaController.listar();
}
