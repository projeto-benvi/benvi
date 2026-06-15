import { NextResponse } from 'next/server';
import { prestadorController } from '@/controller/prestadorController';

export async function GET() {
  return prestadorController.listarDestaques();
}