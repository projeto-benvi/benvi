import { NextResponse } from 'next/server';
import { CategoriaService } from '@/service/categoriaService';

const categoriaService = new CategoriaService();

export async function GET() {
  try {
    const categorias = await categoriaService.listarTodasCategorias();
    return NextResponse.json(categorias, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Erro ao buscar categorias." }, { status: 500 });
  }
}
