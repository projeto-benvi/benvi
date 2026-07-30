import { NextRequest, NextResponse } from 'next/server';
import { SolicitacaoServicoController } from '@/controller/solicitacaoservicoController';
import { authErrorResponse, requireUser } from '@/app/lib/authz';
import { parseIdParam, respostaIdInvalido } from '@/app/lib/validacao';

function assertSolicitacaoAccess(user: { id: number; isAdmin: boolean }, data: any) {
    const idUsuario = Number(data?.id_usuario ?? data?.usuario?.id_usuario);
    const idPrestador = Number(data?.id_prestador ?? data?.prestador?.id_usuario);

    if (!user.isAdmin && idUsuario !== user.id && idPrestador !== user.id) {
        throw new Error('Voce nao tem permissao para acessar esta solicitacao.');
    }
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> } 
) {
    try {
        const user = await requireUser();
        const { id } = await params;  
        const numId = parseIdParam(id);
        if (numId === null) return respostaIdInvalido('id');
        const data = await SolicitacaoServicoController.buscarPorId(numId);
        assertSolicitacaoAccess(user, data);
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Solicitação não encontrada' },
            { status: 404 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireUser();
        const { id } = await params;
        const numId = parseIdParam(id);
        if (numId === null) return respostaIdInvalido('id');
        const atual = await SolicitacaoServicoController.buscarPorId(numId);
        assertSolicitacaoAccess(user, atual);
        const body = await request.json();
        await SolicitacaoServicoController.atualizar(numId, body);
        return NextResponse.json({ message: 'Solicitação atualizada com sucesso' });
    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

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
        const user = await requireUser();
        const { id } = await params;
        const numId = parseIdParam(id);
        if (numId === null) return respostaIdInvalido('id');
        const atual = await SolicitacaoServicoController.buscarPorId(numId);
        assertSolicitacaoAccess(user, atual);
        const removido = await SolicitacaoServicoController.remover(numId);
        if (!removido) {
            return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Solicitação removida com sucesso' });
    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao remover' },
            { status: 500 }
        );
    }
}
