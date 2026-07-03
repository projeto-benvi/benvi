import { NextRequest, NextResponse } from 'next/server';
import { SolicitacaoServicoController } from '@/controller/solicitacaoservicoController';
import { authErrorResponse, requireAdmin, requireResourceOwner, requireUser } from '@/app/lib/authz';

export async function GET(request: NextRequest) {
    try {
        const user = await requireUser();
        const { searchParams } = new URL(request.url);
        const id_usuario   = searchParams.get('id_usuario');
        const id_prestador = searchParams.get('id_prestador');

        let data;

        if (id_usuario) {
            requireResourceOwner(user, id_usuario);
            data = await SolicitacaoServicoController.listarPorUsuario(Number(id_usuario));
        } else if (id_prestador) {
            requireResourceOwner(user, id_prestador);
            data = await SolicitacaoServicoController.listarPorPrestador(Number(id_prestador));
        } else {
            await requireAdmin();
            data = await SolicitacaoServicoController.listar();
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao buscar solicitações' },
            { status: 500 }
        );
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

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro interno' },
            { status: 400 }
        );
    }
}
