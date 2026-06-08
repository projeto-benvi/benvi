import { imagemController } from '@/controller/imagemController';
import { NextRequest } from 'next/server';



export async function GET(  
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return imagemController.buscarPorId(Number(id));
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return imagemController.atualizar(Number(id), req);
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return imagemController.deletar(Number(id));
}