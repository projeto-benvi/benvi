import { NextRequest, NextResponse } from 'next/server';
import { AgendaController } from '@/controller/agendaController';
import { AuthorizationError, authErrorResponse, requireUser } from '@/app/lib/authz';
import { genericApiError } from '@/app/lib/api-error';

function assertAgendaAccess(user: { id: number; isAdmin: boolean }, agenda: any) {
    const idPrestador = Number(agenda?.id_prestador);
    const idCliente = Number(agenda?.id_usuario);

    if (!user.isAdmin && idPrestador !== user.id && idCliente !== user.id) {
        throw new AuthorizationError('Voce nao tem permissao para acessar esta agenda.', 403);
    }
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireUser();
        const { id } = await params;
        const data = await AgendaController.buscarPorId(Number(id));
        assertAgendaAccess(user, data);
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return genericApiError(error, { context: 'agenda.buscar', publicMessage: 'Agenda não encontrada.', status: 404 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireUser();
        const { id } = await params;
        const atual = await AgendaController.buscarPorId(Number(id));
        assertAgendaAccess(user, atual);
        const body = await request.json();

        await AgendaController.atualizar(Number(id), body);

        return NextResponse.json(
            { message: 'Agenda atualizada com sucesso' },
            { status: 200 }
        );

    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return genericApiError(error, { context: 'agenda.atualizar', publicMessage: 'Não foi possível atualizar a agenda.', status: 400 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireUser();
        const { id } = await params;
        const atual = await AgendaController.buscarPorId(Number(id));
        assertAgendaAccess(user, atual);
        const removido = await AgendaController.remover(Number(id));

        if (!removido) {
            return NextResponse.json(
                { error: 'Agenda não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Agenda removida com sucesso' },
            { status: 200 }
        );

    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return genericApiError(error, { context: 'agenda.remover', publicMessage: 'Não foi possível remover a agenda.' });
    }
}
