import { NextRequest, NextResponse } from 'next/server';
import { SolicitacaoServicoController } from '@/controller/solicitacaoservicoController';
import { authErrorResponse, requireAdmin, requireResourceOwner, requireUser } from '@/app/lib/authz';
import { parsePaginacao } from '@/app/lib/paginacao';
import { parseIdParam, respostaIdInvalido } from '@/app/lib/validacao';
import { genericApiError } from '@/app/lib/api-error';

export async function GET(request: NextRequest) {
    try {
        const user = await requireUser();
        const { searchParams } = new URL(request.url);
        const id_usuario   = searchParams.get('id_usuario');
        const id_prestador = searchParams.get('id_prestador');
        const paginacao = parsePaginacao(searchParams);

        let data;

        if (id_usuario) {
            const idUsuarioNum = parseIdParam(id_usuario);
            if (idUsuarioNum === null) return respostaIdInvalido('id_usuario');
            requireResourceOwner(user, idUsuarioNum);
            data = await SolicitacaoServicoController.listarPorUsuario(idUsuarioNum, paginacao);
        } else if (id_prestador) {
            const idPrestadorNum = parseIdParam(id_prestador);
            if (idPrestadorNum === null) return respostaIdInvalido('id_prestador');
            requireResourceOwner(user, idPrestadorNum);
            data = await SolicitacaoServicoController.listarPorPrestador(idPrestadorNum, paginacao);
        } else {
            await requireAdmin();
            data = await SolicitacaoServicoController.listar(paginacao);
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return genericApiError(error, { context: 'solicitacao.listar', publicMessage: 'Erro ao buscar solicitações.' });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await requireUser();
        const body = await request.json();

        if (!body.id_prestador || !body.complemento) {
            return NextResponse.json(
                { error: 'Campos obrigatórios: id_prestador, complemento' },
                { status: 400 }
            );
        }

        const id = await SolicitacaoServicoController.criar({
            id_usuario:       user.id,
            id_prestador:     body.id_prestador,
            endereco:         body.endereco,
            data_agendamento: body.data_agendamento ? new Date(body.data_agendamento) : undefined,
            descricao_servico: body.descricao_servico,
            complemento:      body.complemento,
        });

        return NextResponse.json(
            { id_solicitacao: id, message: 'Solicitação criada com sucesso' },
            { status: 201 }
        );

    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return genericApiError(error, { context: 'solicitacao.criar', publicMessage: 'Não foi possível criar a solicitação.', status: 400 });
    }
}
