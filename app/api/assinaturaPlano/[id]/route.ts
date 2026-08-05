import { NextRequest, NextResponse } from 'next/server';
import { AssinaturaPlanoController } from '@/controller/assinaturaPlanoController';
import { authErrorResponse, requireAdmin, requireUser } from '@/app/lib/authz';
import { genericApiError } from '@/app/lib/api-error';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireUser();
        const { id } = await params;
        const data = await AssinaturaPlanoController.buscarPorId(Number(id));
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return genericApiError(error, { context: 'assinatura.buscar', publicMessage: 'Assinatura não encontrada.', status: 404 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;
        const body = await request.json();

        await AssinaturaPlanoController.atualizar(Number(id), body);

        return NextResponse.json(
            { message: 'Assinatura atualizada com sucesso' },
            { status: 200 }
        );

    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return genericApiError(error, { context: 'assinatura.atualizar', publicMessage: 'Não foi possível atualizar a assinatura.', status: 400 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
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
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return genericApiError(error, { context: 'assinatura.remover', publicMessage: 'Não foi possível remover a assinatura.' });
    }
}
