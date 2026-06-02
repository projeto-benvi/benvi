import { NextRequest, NextResponse } from 'next/server';
import { CategoriaService } from '@/service/categoriaService';

const categoriaService = new CategoriaService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria'); 
    
    const cards = await categoriaService.listarCardsServicos(categoria || undefined);
    return NextResponse.json(cards, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Erro ao buscar serviços." }, { status: 500 });
  }
}
