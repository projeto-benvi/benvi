import { NextRequest, NextResponse } from "next/server";
import {
  listarTagsPorPrestadorController,
  criarTagController,
  deletarTagController,
  substituirTagsDoPrestadorController,
} from "@/controller/tagController";
import { AuthorizationError, authErrorResponse, requireUser } from "@/app/lib/authz";
import { buscarProprietarioDaTag } from "@/service/tagService";
import { parseIdParam, respostaIdInvalido } from "@/app/lib/validacao";
import { genericApiError } from "@/app/lib/api-error";

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
    const user = await requireUser();
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { erro: "Parâmetro 'id' é obrigatório." },
        { status: 400 }
      );
    }

    const idTag = parseIdParam(id);
    if (idTag === null) return respostaIdInvalido("id");
    const ownerId = await buscarProprietarioDaTag(idTag);
    if (ownerId === null) {
      throw new AuthorizationError("Tag não encontrada.", 404);
    }
    if (!user.isAdmin && ownerId !== user.id) {
      throw new AuthorizationError("Voce nao tem permissao para excluir esta tag.", 403);
    }

    return deletarTagController(idTag);
  } catch (error) {
    return authErrorResponse(error) ?? genericApiError(error, {
      context: "tag.excluir",
      publicMessage: "Não foi possível excluir a tag.",
      field: "erro",
    });
  }
}
