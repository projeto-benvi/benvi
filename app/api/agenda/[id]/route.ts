import { NextRequest, NextResponse } from 'next/server';
import { AgendaController } from '@/controller/agendaController';
import { AuthorizationError, authErrorResponse, requireUser } from '@/app/lib/authz';
import { genericApiError } from '@/app/lib/api-error';
import { parseIdParam, respostaIdInvalido } from '@/app/lib/validacao';

type AgendaRecord = Record<string, any>;

const CAMPOS_ATUALIZAVEIS = new Set(['horario_inicio', 'horario_fim', 'status', 'titulo', 'descricao']);
const TRANSICOES_STATUS: Record<string, Set<string>> = {
    pendente: new Set(['confirmado', 'cancelado']),
    confirmado: new Set(['cancelado', 'concluido']),
    cancelado: new Set(),
    concluido: new Set(),
};

function assertAgendaReadAccess(user: { id: number; isAdmin: boolean }, agenda: AgendaRecord) {
    const idPrestador = Number(agenda?.id_prestador);
    const idCliente = Number(agenda?.id_usuario);

    if (!user.isAdmin && idPrestador !== user.id && idCliente !== user.id) {
        throw new AuthorizationError('Voce nao tem permissao para acessar esta agenda.', 403);
    }
}

function assertAgendaWriteAccess(user: { id: number; isAdmin: boolean }, agenda: AgendaRecord) {
    if (!user.isAdmin && Number(agenda?.id_prestador) !== user.id) {
        throw new AuthorizationError('Voce nao tem permissao para alterar esta agenda.', 403);
    }
}

function validarPayloadAgenda(atual: AgendaRecord, body: unknown) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new AuthorizationError('Payload de atualização inválido.', 400);
    }

    const dados = body as Record<string, unknown>;
    const chaves = Object.keys(dados);
    if (chaves.length === 0 || chaves.some((campo) => !CAMPOS_ATUALIZAVEIS.has(campo))) {
        throw new AuthorizationError('Payload contém campos não permitidos.', 400);
    }

    if ('status' in dados) {
        if (typeof dados.status !== 'string') {
            throw new AuthorizationError('Status de agenda inválido.', 400);
        }
        const statusAtual = String(atual.status ?? '').toLowerCase();
        const proximoStatus = dados.status.toLowerCase();
        const transicoesPermitidas = TRANSICOES_STATUS[statusAtual];
        if (!transicoesPermitidas || !transicoesPermitidas.has(proximoStatus)) {
            throw new AuthorizationError('Transição de status não permitida.', 409);
        }
        dados.status = proximoStatus;
    }

    if (['cancelado', 'concluido'].includes(String(atual.status ?? '').toLowerCase())) {
        throw new AuthorizationError('Agendamentos encerrados não podem ser alterados.', 409);
    }

    return dados;
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireUser();
        const { id } = await params;
        const idAgenda = parseIdParam(id);
        if (idAgenda === null) return respostaIdInvalido('id');
        const data = await AgendaController.buscarPorId(idAgenda);
        assertAgendaReadAccess(user, data);
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
        const idAgenda = parseIdParam(id);
        if (idAgenda === null) return respostaIdInvalido('id');
        const atual = await AgendaController.buscarPorId(idAgenda);
        assertAgendaWriteAccess(user, atual);
        const body = await request.json();
        const dadosPermitidos = validarPayloadAgenda(atual, body);

        await AgendaController.atualizar(idAgenda, dadosPermitidos);

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
        const idAgenda = parseIdParam(id);
        if (idAgenda === null) return respostaIdInvalido('id');
        const atual = await AgendaController.buscarPorId(idAgenda);
        assertAgendaWriteAccess(user, atual);
        if (['cancelado', 'concluido'].includes(String(atual.status ?? '').toLowerCase())) {
            throw new AuthorizationError('Agendamentos encerrados não podem ser excluídos.', 409);
        }
        const removido = await AgendaController.remover(idAgenda);

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
