import { NextRequest, NextResponse } from 'next/server';
import { ParceriaController } from '@/controller/parceriaController';
import { authErrorResponse, requireAdmin } from '@/app/lib/authz';
import { genericApiError } from '@/app/lib/api-error';

type Params = Promise<{ id: string }>;

export async function GET(
    _request: NextRequest,
    { params }: { params: Params }
) {
    try {
        await requireAdmin();
        const { id } = await params;
        const data = await ParceriaController.buscarPorId(Number(id));
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return genericApiError(error, { context: 'parceria.buscar', publicMessage: 'Parceria não encontrada.', status: 404 });
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
        await ParceriaController.atualizar(Number(id), body);
        return NextResponse.json(
            { message: 'Parceria atualizada com sucesso' },
            { status: 200 }
        );
    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return genericApiError(error, { context: 'parceria.atualizar', publicMessage: 'Não foi possível atualizar a parceria.', status: 400 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Params }
) {
    try {
        await requireAdmin();
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
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;
        return genericApiError(error, { context: 'parceria.remover', publicMessage: 'Não foi possível remover a parceria.' });
    }
}
