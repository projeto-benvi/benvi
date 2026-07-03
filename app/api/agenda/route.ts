
import { NextRequest, NextResponse } from 'next/server';
import { AgendaController } from '@/controller/agendaController';
import { authErrorResponse, requireAdmin, requireResourceOwner, requireUser } from '@/app/lib/authz';

export async function GET(request: NextRequest) {
    try {
        const user = await requireUser();
        const { searchParams } = new URL(request.url);
        const id_prestador   = searchParams.get('id_prestador');
        const id_solicitacao = searchParams.get('id_solicitacao');

        let data;

        if (id_prestador) {
            requireResourceOwner(user, id_prestador);
            data = await AgendaController.listarPorPrestador(Number(id_prestador));
        } else if (id_solicitacao) {
            data = await AgendaController.listarPorSolicitacao(Number(id_solicitacao));
        } else {
            await requireAdmin();
            data = await AgendaController.listar();
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao buscar agendas' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await requireUser();
        const body = await request.json();

        if (!body.id_prestador || !body.horario_inicio || !body.horario_fim || !body.titulo) {
            return NextResponse.json(
                { error: 'Campos obrigatórios: id_prestador, horario_inicio, horario_fim, titulo' },
                { status: 400 }
            );
        }
        requireResourceOwner(user, body.id_prestador);

        const id = await AgendaController.criar({
            id_prestador:   body.id_prestador,
            id_solicitacao: body.id_solicitacao ?? null,
            horario_inicio: new Date(body.horario_inicio),
            horario_fim:    new Date(body.horario_fim),
            status:         body.status,
            titulo:         body.titulo,
            descricao:      body.descricao,
        });

        return NextResponse.json(
            { id_agenda: id, message: 'Agenda criada com sucesso' },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro interno' },
            { status: 400 }
        );
    }
}
