import { NextRequest, NextResponse } from 'next/server';
import { ReporteController } from '@/controller/reporteController';
import { authErrorResponse, requireAdmin, requireUser } from '@/app/lib/authz';
import { genericApiError } from '@/app/lib/api-error';

type Params = Promise<{ id: string }>;

export async function GET(
    _request: NextRequest,
    { params }: { params: Params }
) {
    try {
        await requireUser();
        const { id } = await params;
        const data = await ReporteController.buscarPorId(Number(id));
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return genericApiError(error, { context: 'reporte.buscar', publicMessage: 'Reporte não encontrado.', status: 404 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Params }
) {
    try {
        await requireAdmin();
        const { id } = await params;
        const body   = await request.json();
        await ReporteController.atualizar(Number(id), body);
        return NextResponse.json(
            { message: 'Reporte atualizado com sucesso' },
            { status: 200 }
        );
    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return genericApiError(error, { context: 'reporte.atualizar', publicMessage: 'Não foi possível atualizar o reporte.', status: 400 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Params }
) {
    try {
        await requireAdmin();
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
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return genericApiError(error, { context: 'reporte.remover', publicMessage: 'Não foi possível remover o reporte.' });
    }
}
