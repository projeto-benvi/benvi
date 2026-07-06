import { authErrorResponse, requireAdmin } from '@/app/lib/authz';
import {
  AdminAlertError,
  PublicoAlvoAlerta,
  adminAlertService,
  validarAlertaMassaInput,
} from '@/service/adminAlertService';
import { NextRequest, NextResponse } from 'next/server';

function mapAdminAlertError(error: unknown) {
  if (error instanceof AdminAlertError) {
    return NextResponse.json({ erro: error.message }, { status: error.status });
  }

  console.error('Erro seguro na rota administrativa de alertas.', {
    tipo: error instanceof Error ? error.name : typeof error,
    mensagem: error instanceof Error ? error.message : String(error),
  });

  return NextResponse.json({ erro: 'Erro ao processar alerta.' }, { status: 500 });
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const publicoAlvo = req.nextUrl.searchParams.get('publicoAlvo') as PublicoAlvoAlerta | null;

    if (!publicoAlvo) {
      return NextResponse.json({ erro: 'Publico-alvo obrigatório.' }, { status: 400 });
    }

    const total = await adminAlertService.estimarDestinatarios(publicoAlvo);
    return NextResponse.json({ total_destinatarios: total });
  } catch (error) {
    return authErrorResponse(error) ?? mapAdminAlertError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const input = validarAlertaMassaInput(body);
    const resultado = await adminAlertService.enviarAlertaMassa(admin.id, input);

    return NextResponse.json(
      {
        mensagem: 'Alerta enviado com sucesso.',
        ...resultado,
      },
      { status: 201 }
    );
  } catch (error) {
    return authErrorResponse(error) ?? mapAdminAlertError(error);
  }
}
