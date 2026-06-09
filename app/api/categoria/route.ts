import { NextRequest, NextResponse } from "next/server";

import {
  listarCategoriasController,
  buscarCategoriaPorIdController,
  criarCategoriaController,
  atualizarCategoriaController,
  deletarCategoriaController,
} from "@/controller/categoriaController";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    return buscarCategoriaPorIdController(Number(id));
  }

  return listarCategoriasController();
}

export async function POST(req: NextRequest) {
  return criarCategoriaController(req);
}

export async function PUT(req: NextRequest) {
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
}

export async function DELETE(req: NextRequest) {
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
}

