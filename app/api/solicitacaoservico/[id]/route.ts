import { NextRequest, NextResponse } from 'next/server';
import { SolicitacaoServicoController } from '@/controller/solicitacaoservicoController';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> } 
) {
    try {
        const { id } = await params;  
        const numId = Number(id);
        const data = await SolicitacaoServicoController.buscarPorId(numId);
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
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
        const { id } = await params;
        const body = await request.json();
        await SolicitacaoServicoController.atualizar(Number(id), body);
        return NextResponse.json({ message: 'Solicitação atualizada com sucesso' });
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
        const removido = await SolicitacaoServicoController.remover(Number(id));
        if (!removido) {
            return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Solicitação removida com sucesso' });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao remover' },
            { status: 500 }
        );
    }
}