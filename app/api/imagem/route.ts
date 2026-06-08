import { imagemController } from '@/controller/imagemController';
import { NextRequest } from 'next/server';

export async function GET() {
    return imagemController.listar();
}

export async function POST(req: NextRequest) {
    return imagemController.criar(req);
}