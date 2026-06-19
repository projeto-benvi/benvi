import { NextRequest, NextResponse } from "next/server";
import {
  listarCategorias,
  buscarCategoriaPorId,
  criarCategoria,
  atualizarCategoria,
  deletarCategoria,
} from "@/service/categoriaService";

export async function listarCategoriasController() {
  try {
    const categorias = await listarCategorias();
    return NextResponse.json(categorias);
  } catch (error) {

    console.error("====== 🚨 ERRO REAL DO BANCO DE DADOS 🚨 ======");
    console.error(error);
    console.error("===============================================");



    return NextResponse.json(
      { erro: "Erro ao listar categorias." },
      { status: 500 }
    );
  }
}

export async function buscarCategoriaPorIdController(id: number) {
  try {
    const categoria = await buscarCategoriaPorId(id);

    if (!categoria) {
      return NextResponse.json(
        { erro: "Categoria não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json(categoria);
  } catch (error) {
    return NextResponse.json(
      { erro: "Erro ao buscar categoria." },
      { status: 500 }
    );
  }
}

export async function criarCategoriaController(req: NextRequest) {
  try {
    const dados = await req.json();

    if (!dados.nome_categoria) {
      return NextResponse.json(
        { erro: "O nome da categoria é obrigatório." },
        { status: 400 }
      );
    }

    const novaCategoria = await criarCategoria(dados);
    return NextResponse.json(novaCategoria, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { erro: "Erro ao criar categoria." },
      { status: 500 }
    );
  }
}

export async function atualizarCategoriaController(
  id: number,
  req: NextRequest
) {
  try {
    const dados = await req.json();

    const categoriaAtualizada = await atualizarCategoria(id, dados);

    return NextResponse.json(categoriaAtualizada);
  } catch (error) {
    return NextResponse.json(
      { erro: "Erro ao atualizar categoria." },
      { status: 500 }
    );
  }
}

export async function deletarCategoriaController(id: number) {
  try {
    await deletarCategoria(id);

    return NextResponse.json({
      mensagem: "Categoria deletada com sucesso.",
    });
  } catch (error) {
    return NextResponse.json(
      { erro: "Erro ao deletar categoria." },
      { status: 500 }
    );
  }
}
