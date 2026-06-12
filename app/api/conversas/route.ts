// app/api/conversas/route.ts
import { NextResponse } from 'next/server';
import { ConversaController } from '@/controller/conversaController'; // Ajuste o caminho se não usar @/

const conversaController = new ConversaController();

// POST: Criar ou buscar uma conversa
export async function POST(request: Request) {
  try {
    const corpo = await request.json();
    const resultado = await conversaController.criarConversa(corpo);
    return NextResponse.json(resultado, { status: 200 });
  } catch (erro: any) {
    return NextResponse.json({ erro: erro.message }, { status: 400 });
  }
}

// GET: Listar conversas de um participante
// Exemplo de URL: /api/conversas?idParticipante=1&tipoParticipante=usuario
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParticipante = searchParams.get('idParticipante');
    const tipoParticipante = searchParams.get('tipoParticipante') as 'usuario' | 'prestador';

    if (!idParticipante || !tipoParticipante) {
      return NextResponse.json({ erro: 'Parâmetros ausentes' }, { status: 400 });
    }

    const resultado = await conversaController.listarConversas(idParticipante, tipoParticipante);
    return NextResponse.json(resultado, { status: 200 });
  } catch (erro: any) {
    return NextResponse.json({ erro: erro.message }, { status: 400 });
  }
}