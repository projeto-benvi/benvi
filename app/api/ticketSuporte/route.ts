import { ticketSuporteController } from '@/controller/ticketSuporteController';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return ticketSuporteController.criar(req);
}

export async function GET(req: NextRequest) {
  return ticketSuporteController.listar(req);
}