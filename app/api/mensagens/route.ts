// app/api/mensagens/route.ts
import { NextResponse } from 'next/server';
import { MensagemController } from '@/controller/mensagemController';

const mensagemController = new MensagemController();

// POST: Enviar uma mensagem
export async function POST(request: Request) {
  try {
    const corpo = await request.json();
    const resultado = await mensagemController.enviarMensagem(corpo);
    return NextResponse.json(resultado, { status: 201 });
  } catch (erro: any) {
    return NextResponse.json({ erro: erro.message }, { status: 400 });
  }
}

// GET: Listar histórico de uma conversa
// Exemplo de URL: /api/mensagens?idConversa=1
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idConversa = searchParams.get('idConversa');

    if (!idConversa) {
      return NextResponse.json({ erro: 'idConversa é obrigatório' }, { status: 400 });
    }

    const resultado = await mensagemController.listarMensagens(idConversa);
    return NextResponse.json(resultado, { status: 200 });
  } catch (erro: any) {
    return NextResponse.json({ erro: erro.message }, { status: 400 });
  }
}