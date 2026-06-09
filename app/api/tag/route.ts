import { NextRequest, NextResponse } from "next/server";
import {
  listarTagsPorPrestadorController,
  criarTagController,
  deletarTagController,
} from "@/controller/tagController";

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
  return criarTagController(req);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { erro: "Parâmetro 'id' é obrigatório." },
      { status: 400 }
    );
  }

  return deletarTagController(Number(id));
}