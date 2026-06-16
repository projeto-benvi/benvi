// app/api/reporte/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ReporteController } from '@/controller/reporteController';

// Next.js 15: params é uma Promise
type Params = Promise<{ id: string }>;

/**
 * GET /api/reporte/:id
 * Retorna detalhes completos de um reporte:
 * dados do reporte + usuário que reportou + usuário reportado + admin (se houver).
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { id } = await params;
        const data = await ReporteController.buscarPorId(Number(id));
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Reporte não encontrado' },
            { status: 404 }
        );
    }
}

/**
 * PATCH /api/reporte/:id
 * Atualiza um reporte — usado principalmente pelo admin para:
 * - Alterar o status (em_analise, resolvido, arquivado)
 * - Vincular o admin responsável (id_admin)
 *
 * Campos permitidos: id_admin, assunto, arquivo, tipo_problema, descricao, status
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { id } = await params;
        const body   = await request.json();
        await ReporteController.atualizar(Number(id), body);
        return NextResponse.json(
            { message: 'Reporte atualizado com sucesso' },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao atualizar' },
            { status: 400 }
        );
    }
}

/**
 * DELETE /api/reporte/:id
 * Remove um reporte pelo ID.
 */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { id }   = await params;
        const removido = await ReporteController.remover(Number(id));

        if (!removido) {
            return NextResponse.json(
                { error: 'Reporte não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Reporte removido com sucesso' },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao remover' },
            { status: 500 }
        );
    }
}
