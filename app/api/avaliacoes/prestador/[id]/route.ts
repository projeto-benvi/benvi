import { NextResponse } from 'next/server';
import { AvaliacaoController } from '@/controller/avaliacaoController';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Extrai os parâmetros de busca (Query Params) da URL
    const { searchParams } = new URL(request.url);
    
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 10);
    const ordem = searchParams.get("ordem") === "antigas" ? "antigas" : "recentes";
    
    const notaParam = searchParams.get("nota");
    const nota = notaParam !== null ? Number(notaParam) : null;

    console.log(`Buscando avaliações para o Prestador ID: ${id} | Página: ${page} | Filtro Nota: ${nota} | Ordem: ${ordem}`);

    // Passa o id e as opções de paginação/filtro para o seu Controller
    const resultado = await AvaliacaoController.listarPorPrestador(
      Number(id),
      { page, limit, ordem, nota }
    );

    return NextResponse.json(
      resultado,
      { status: 200 }
    );

  } catch (error) {
    console.error("Erro na rota de listagem de avaliações:", error);
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}