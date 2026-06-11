import { NextRequest, NextResponse } from 'next/server';
import { AssinaturaPlanoController } from '@/controller/assinaturaPlanoController';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id_prestador = searchParams.get('id_prestador');
        const ativa         = searchParams.get('ativa');

        let data;

        if (id_prestador && ativa === 'true') {
            data = await AssinaturaPlanoController.buscarAtivaByPrestador(Number(id_prestador));
        } else if (id_prestador) {
            data = await AssinaturaPlanoController.listarPorPrestador(Number(id_prestador));
        } else {
            data = await AssinaturaPlanoController.listar();
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao buscar assinaturas' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.id_prestador || !body.valor_pago || !body.data_inicio || !body.data_fim) {
            return NextResponse.json(
                { error: 'Campos obrigatórios: id_prestador, valor_pago, data_inicio, data_fim' },
                { status: 400 }
            );
        }

        const id = await AssinaturaPlanoController.criar({
            id_prestador:     body.id_prestador,
            valor_pago:       body.valor_pago,
            data_inicio:      new Date(body.data_inicio),
            data_fim:         new Date(body.data_fim),
            status_pagamento: body.status_pagamento,
            ativo:            body.ativo,
        });

        return NextResponse.json(
            { id_assinatura: id, message: 'Assinatura criada com sucesso' },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro interno' },
            { status: 400 }
        );
    }
}