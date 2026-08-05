// app/api/parceria/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ParceriaController } from '@/controller/parceriaController';
import { authErrorResponse, requireAdmin } from '@/app/lib/authz';
import { genericApiError } from '@/app/lib/api-error';

/**
 * GET /api/parceria
 * Lista todas as parcerias.
 *
 * GET /api/parceria?status=ativo
 * GET /api/parceria?estado=PE
 * GET /api/parceria?status=ativo&estado=PE   ← agora os dois juntos funcionam
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const estado = searchParams.get('estado');

        let data = await ParceriaController.listar();

        if (status) {
            data = data.filter((p: any) => p.status?.toLowerCase() === status.toLowerCase());
        }

        if (estado) {
            data = data.filter((p: any) => p.estado?.toLowerCase() === estado.toLowerCase());
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        return genericApiError(error, { context: 'parceria.listar', publicMessage: 'Erro ao buscar parcerias.' });
    }
}

/**
 * POST /api/parceria
 * Cria uma nova parceria.
 *
 * Body obrigatório: nome_parceiro, cidade, estado, data_inicio
 * Body opcional:    status, data_fim
 */
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();
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
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return genericApiError(error, { context: 'parceria.criar', publicMessage: 'Não foi possível criar a parceria.', status: 400 });
    }
}
