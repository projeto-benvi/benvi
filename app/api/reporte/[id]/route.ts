import { NextRequest, NextResponse } from 'next/server';
import { ReporteController } from '@/controller/reporteController';

type Params = Promise<{ id: string }>;

export async function GET(
    _request: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { id } = await params;
        const data = await ReporteController.buscarPorId(Number(id));
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Reporte não encontrado' },
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
        await ReporteController.atualizar(Number(id), body);
        return NextResponse.json(
            { message: 'Reporte atualizado com sucesso' },
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
        const removido = await ReporteController.remover(Number(id));

        if (!removido) {
            return NextResponse.json(
                { error: 'Reporte não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Reporte removido com sucesso' },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao remover' },
            { status: 500 }
        );
    }
}
