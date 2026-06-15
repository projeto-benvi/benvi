import { notificacaoController } from '@/controller/notificacaoController';
import { NextRequest } from 'next/server';

//http://localhost:3000/api/notificacao?id_usuario=3 - Listar notificações do usuário
//http://localhost:3000/api/notificacao/1 - Buscar notificação por ID, marcar como visualizada ou deletar

export async function POST(req: NextRequest) {
  return notificacaoController.criar(req);
}

export async function GET(req: NextRequest) {
  return notificacaoController.listarPorUsuario(req);
}