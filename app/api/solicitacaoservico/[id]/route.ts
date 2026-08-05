import { NextRequest, NextResponse } from 'next/server';
import { SolicitacaoServicoController } from '@/controller/solicitacaoservicoController';
import { AuthorizationError, authErrorResponse, requireUser, type AuthenticatedUser } from '@/app/lib/authz';
import { parseIdParam, respostaIdInvalido } from '@/app/lib/validacao';
import { genericApiError } from '@/app/lib/api-error';

function participantes(data: any) {
    return {
        idUsuario: Number(data?.id_usuario ?? data?.usuario?.id_usuario),
        idPrestador: Number(data?.id_prestador ?? data?.prestador?.id_usuario),
    };
}

function assertSolicitacaoAccess(user: AuthenticatedUser, data: any) {
    const { idUsuario, idPrestador } = participantes(data);

    if (!user.isAdmin && idUsuario !== user.id && idPrestador !== user.id) {
        throw new AuthorizationError('Voce nao tem permissao para acessar esta solicitacao.', 403);
    }
}

function solicitacaoPendente(data: any) {
    return data?.status === false || data?.status === 0 || String(data?.status).toLowerCase() === 'pendente';
}

function normalizarStatus(value: unknown): 0 | 1 | null {
    if ([true, 1, '1', 'aceito'].includes(value as any)) return 1;
    if ([false, 0, '0', 'pendente'].includes(value as any)) return 0;
    return null;
}

function payloadAtualizacao(user: AuthenticatedUser, atual: any, body: unknown) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new AuthorizationError('Payload de atualização inválido.', 400);
    }

    const dados = body as Record<string, unknown>;
    const chaves = Object.keys(dados);
    const { idUsuario, idPrestador } = participantes(atual);

    if (chaves.length === 0) {
        throw new AuthorizationError('Nenhum campo válido foi informado.', 400);
    }

    if (user.isAdmin) {
        const permitidos = new Set(['endereco', 'data_agendamento', 'status', 'descricao_servico', 'complemento']);
        if (chaves.some((chave) => !permitidos.has(chave))) {
            throw new AuthorizationError('Payload contém campos não permitidos.', 400);
        }
        if ('status' in dados) {
            const status = normalizarStatus(dados.status);
            if (status === null) throw new AuthorizationError('Status de solicitação inválido.', 400);
            if (!solicitacaoPendente(atual) && status !== 1) {
                throw new AuthorizationError('Solicitações processadas não podem voltar ao estado pendente.', 409);
            }
            dados.status = status;
        }
        return dados;
    }

    if (!solicitacaoPendente(atual)) {
        throw new AuthorizationError('Solicitações já processadas não podem ser alteradas.', 409);
    }

    if (user.id === idPrestador) {
        if (chaves.length !== 1 || chaves[0] !== 'status' || normalizarStatus(dados.status) !== 1) {
            throw new AuthorizationError('O prestador pode apenas aceitar uma solicitação pendente.', 403);
        }
        return { status: 1 };
    }

    if (user.id === idUsuario) {
        const permitidos = new Set(['endereco', 'data_agendamento', 'descricao_servico', 'complemento']);
        if (chaves.some((chave) => !permitidos.has(chave))) {
            throw new AuthorizationError('O cliente pode alterar apenas os dados da solicitação pendente.', 403);
        }
        return dados;
    }

    throw new AuthorizationError('Voce nao tem permissao para atualizar esta solicitação.', 403);
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

        return genericApiError(error, { context: 'solicitacao.buscar', publicMessage: 'Solicitação não encontrada.', status: 404 });
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
        const dadosPermitidos = payloadAtualizacao(user, atual, body);
        await SolicitacaoServicoController.atualizar(numId, dadosPermitidos);
        return NextResponse.json({ message: 'Solicitação atualizada com sucesso' });
    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return genericApiError(error, { context: 'solicitacao.atualizar', publicMessage: 'Não foi possível atualizar a solicitação.', status: 400 });
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
        if (!user.isAdmin && !solicitacaoPendente(atual)) {
            throw new AuthorizationError('Solicitações já processadas não podem ser removidas.', 409);
        }
        const removido = await SolicitacaoServicoController.remover(numId);
        if (!removido) {
            return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Solicitação removida com sucesso' });
    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return genericApiError(error, { context: 'solicitacao.remover', publicMessage: 'Não foi possível remover a solicitação.' });
    }
}
