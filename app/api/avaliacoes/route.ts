import { NextResponse } from 'next/server';
import { AvaliacaoModel, Avaliacao } from '@/model/avaliacaoModel';

// GET: Listar avaliações
export async function GET() {
  try {
    const avaliacoes: Avaliacao[] = await AvaliacaoModel.getAll();
    return NextResponse.json(avaliacoes, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar avaliações' }, { status: 500 });
  }
}

// POST: Inserir avaliação
export async function POST(request: Request) {
  try {
    // Mapeia o corpo da requisição diretamente para a sua interface
    const corpo: Avaliacao = await request.json();

    // Validação estrita dos campos obrigatórios da interface
    if (corpo.nota === undefined || corpo.nota === null) {
      return NextResponse.json({ error: 'A nota é obrigatória' }, { status: 400 });
    }

    // Passa os dados tipados para o model
    const newId = await AvaliacaoModel.create(corpo.nota, corpo.comentario);
    
    return NextResponse.json(
      { id_avaliacao: newId, message: 'Avaliação enviada com sucesso!' }, 
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar avaliação' }, { status: 500 });
  }
}

