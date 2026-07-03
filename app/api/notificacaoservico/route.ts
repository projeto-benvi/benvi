import {NotificacaoServicoController } from "../../../controller/notificacaoServicoController";
import { authErrorResponse, requireAdmin } from "@/app/lib/authz";
import { NextResponse } from "next/server";


const controller = new NotificacaoServicoController();

export async function POST(request: Request) {
  try {
    await requireAdmin();
    return controller.handleCriar(request);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: "Erro ao criar notificacao de servico." }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireAdmin();
    return controller.handleListar();
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: "Erro ao listar notificacoes de servico." }, { status: 500 });
  }
}
