import { NextRequest, NextResponse } from "next/server";

import {
  listarCategoriasController,
  buscarCategoriaPorIdController,
  criarCategoriaController,
  atualizarCategoriaController,
  deletarCategoriaController,
} from "@/controller/categoriaController";
import { authErrorResponse, requireAdmin } from "@/app/lib/authz";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    return buscarCategoriaPorIdController(Number(id));
  }

  return listarCategoriasController();
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    return criarCategoriaController(req);
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: "Erro ao criar categoria." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          erro: "Parâmetro 'id' é obrigatório.",
        },
        {
          status: 400,
        }
      );
    }

    return atualizarCategoriaController(
      Number(id),
      req
    );
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: "Erro ao atualizar categoria." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          erro: "Parâmetro 'id' é obrigatório.",
        },
        {
          status: 400,
        }
      );
    }

    return deletarCategoriaController(
      Number(id)
    );
  } catch (error) {
    return authErrorResponse(error) ?? NextResponse.json({ erro: "Erro ao deletar categoria." }, { status: 500 });
  }
}

