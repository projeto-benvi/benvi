import { NextRequest, NextResponse } from 'next/server';
import { ParceriaController } from '@/controller/parceriaController';

type Params = Promise<{ id: string }>;

export async function GET(
    _request: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { id } = await params;
        const data = await ParceriaController.buscarPorId(Number(id));
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Parceria não encontrada' },
            { status: 404 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { id } = await params;
        const body   = await request.json();
        await ParceriaController.atualizar(Number(id), body);
        return NextResponse.json(
            { message: 'Parceria atualizada com sucesso' },
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
    { params }: { params: Params }
) {
    try {
        const { id }   = await params;
        const removido = await ParceriaController.remover(Number(id));

        if (!removido) {
            return NextResponse.json(
                { error: 'Parceria não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Parceria removida com sucesso' },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao remover' },
            { status: 500 }
        );
    }
}
