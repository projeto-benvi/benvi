import { NextRequest, NextResponse } from "next/server";
import {
  listarTagsPorPrestadorController,
  criarTagController,
  deletarTagController,
  substituirTagsDoPrestadorController,
} from "@/controller/tagController";
import { authErrorResponse, requireUser } from "@/app/lib/authz";

export async function GET(req: NextRequest) {
  const idPrestador = req.nextUrl.searchParams.get("id_prestador");

  if (!idPrestador) {
    return NextResponse.json(
      { erro: "Parâmetro 'id_prestador' é obrigatório." },
      { status: 400 }
    );
  }

  return listarTagsPorPrestadorController(Number(idPrestador));
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    return criarTagController(req, user.id);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: "Erro ao criar tag." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireUser();
    return substituirTagsDoPrestadorController(req, user.id);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: "Erro ao atualizar tags." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireUser();
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { erro: "Parâmetro 'id' é obrigatório." },
        { status: 400 }
      );
    }

    return deletarTagController(Number(id));
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: "Erro ao deletar tag." }, { status: 500 });
  }
}
