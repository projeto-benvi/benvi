import { alertaController } from '@/controller/alertaController';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireAdmin } from '@/app/lib/authz';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    return alertaController.buscarPorId(Number(id));
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao buscar alerta.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    return alertaController.atualizar(Number(id), req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao atualizar alerta.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    return alertaController.deletar(Number(id));
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: 'Erro ao deletar alerta.' }, { status: 500 });
  }
}
