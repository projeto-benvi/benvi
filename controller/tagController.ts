import { NextRequest, NextResponse } from "next/server";
import { criarTag, listarTagsPorPrestador, deletarTag } from "@/service/tagService";

export async function listarTagsPorPrestadorController(idPrestador: number) {
  try {
    const tags = await listarTagsPorPrestador(idPrestador);
    return NextResponse.json(tags);
  } catch (error) {
    return NextResponse.json(
      { erro: "Erro ao listar tags do prestador." },
      { status: 500 }
    );
  }
}

export async function criarTagController(req: NextRequest) {
  try {
    const dados = await req.json();

    if (!dados.id_categoria || !dados.id_prestador) {
      return NextResponse.json(
        { erro: "Os campos id_categoria e id_prestador são obrigatórios." },
        { status: 400 }
      );
    }

    const novaTag = await criarTag(dados);
    return NextResponse.json(novaTag, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { erro: "Erro ao vincular tag." },
      { status: 500 }
    );
  }
}

export async function deletarTagController(id: number) {
  try {
    await deletarTag(id);
    return NextResponse.json({ mensagem: "Tag deletada com sucesso." });
  } catch (error) {
    return NextResponse.json(
      { erro: "Erro ao deletar tag." },
      { status: 500 }
    );
  }
}