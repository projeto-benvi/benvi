import { NextRequest, NextResponse } from 'next/server';
import { SolicitacaoServicoController } from '@/controller/solicitacaoservicoController';
import { authErrorResponse, requireUser } from '@/app/lib/authz';

function assertSolicitacaoAccess(user: { id: number; isAdmin: boolean }, data: any) {
    if (!user.isAdmin && Number(data?.id_usuario) !== user.id && Number(data?.id_prestador) !== user.id) {
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
        const numId = Number(id);
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
        const atual = await SolicitacaoServicoController.buscarPorId(Number(id));
        assertSolicitacaoAccess(user, atual);
        const body = await request.json();
        await SolicitacaoServicoController.atualizar(Number(id), body);
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
        const atual = await SolicitacaoServicoController.buscarPorId(Number(id));
        assertSolicitacaoAccess(user, atual);
        const removido = await SolicitacaoServicoController.remover(Number(id));
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
