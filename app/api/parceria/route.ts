import { NextRequest, NextResponse } from 'next/server';
import { ParceriaController } from '@/controller/parceriaController';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const estado = searchParams.get('estado');

        let data;

        if (status) {
            data = await ParceriaController.listarPorStatus(status);
        } else if (estado) {
            data = await ParceriaController.listarPorEstado(estado);
        } else {
            data = await ParceriaController.listar();
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao buscar parcerias' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.nome_parceiro || !body.cidade || !body.estado || !body.data_inicio) {
            return NextResponse.json(
                { error: 'Campos obrigatórios: nome_parceiro, cidade, estado, data_inicio' },
                { status: 400 }
            );
        }

        const id = await ParceriaController.criar({
            nome_parceiro: body.nome_parceiro,
            cidade:        body.cidade,
            estado:        body.estado,
            status:        body.status,
            data_inicio:   new Date(body.data_inicio),
            data_fim:      body.data_fim ? new Date(body.data_fim) : undefined,
        });

        return NextResponse.json(
            { id_parceria: id, message: 'Parceria criada com sucesso' },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro interno' },
            { status: 400 }
        );
    }
}
