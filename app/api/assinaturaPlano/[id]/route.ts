import { NextRequest, NextResponse } from 'next/server';
import { AssinaturaPlanoController } from '@/controller/assinaturaPlanoController';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await AssinaturaPlanoController.buscarPorId(Number(id));
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Assinatura não encontrada' },
            { status: 404 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        await AssinaturaPlanoController.atualizar(Number(id), body);

        return NextResponse.json(
            { message: 'Assinatura atualizada com sucesso' },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao atualizar' },
            { status: 400 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const removido = await AssinaturaPlanoController.remover(Number(id));

        if (!removido) {
            return NextResponse.json(
                { error: 'Assinatura não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Assinatura removida com sucesso' },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao remover' },
            { status: 500 }
        );
    }
}