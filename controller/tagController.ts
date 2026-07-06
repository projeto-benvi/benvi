import { NextRequest, NextResponse } from "next/server";
import {
  criarTag,
  listarTagsPorPrestador,
  deletarTag,
  substituirTagsDoPrestador,
} from "@/service/tagService";

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

export async function criarTagController(req: NextRequest, idPrestadorAutenticado?: number) {
  try {
    const dados = await req.json();
    if (idPrestadorAutenticado) dados.id_prestador = idPrestadorAutenticado;

    if (!dados.id_prestador) {
      return NextResponse.json(
        { erro: "O campo id_prestador é obrigatório." },
        { status: 400 }
      );
    }

    if (Array.isArray(dados.id_categorias)) {
      const tags = await substituirTagsDoPrestador(Number(dados.id_prestador), dados.id_categorias);
      return NextResponse.json(tags, { status: 200 });
    }

    if (!dados.id_categoria) {
      return NextResponse.json(
        { erro: "O campo id_categoria é obrigatório." },
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

export async function substituirTagsDoPrestadorController(req: NextRequest, idPrestadorAutenticado?: number) {
  try {
    const dados = await req.json();
    if (idPrestadorAutenticado) dados.id_prestador = idPrestadorAutenticado;

    if (!dados.id_prestador || !Array.isArray(dados.id_categorias)) {
      return NextResponse.json(
        { erro: "Os campos id_prestador e id_categorias são obrigatórios." },
        { status: 400 }
      );
    }

    const tags = await substituirTagsDoPrestador(Number(dados.id_prestador), dados.id_categorias);
    return NextResponse.json(tags);
  } catch (error) {
    console.error("ERRO AO ATUALIZAR TAGS:", error);
    return NextResponse.json(
      { erro: "Erro ao atualizar tags do prestador.", detalhes: String(error) },
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
