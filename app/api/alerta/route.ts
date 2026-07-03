import { alertaController } from '@/controller/alertaController';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireAdmin } from '@/app/lib/authz';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    return alertaController.criar(req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao criar alerta.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    return alertaController.listar(req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao listar alertas.' }, { status: 500 });
  }
}
