// app/api/reporte/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ReporteController } from '@/controller/reporteController';

/**
 * GET /api/reporte
 * Lista todos os reportes com dados completos (JOIN usuario x2 + admin).
 *
 * GET /api/reporte?id_reportou=X
 * Lista reportes feitos por um usuário.
 *
 * GET /api/reporte?id_reportado=X
 * Lista reportes recebidos por um usuário.
 *
 * GET /api/reporte?status=pendente
 * Filtra por status: pendente | em_analise | resolvido | arquivado
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id_reportou  = searchParams.get('id_reportou');
        const id_reportado = searchParams.get('id_reportado');
        const status       = searchParams.get('status');

        let data;

        if (id_reportou) {
            data = await ReporteController.listarPorReportou(Number(id_reportou));
        } else if (id_reportado) {
            data = await ReporteController.listarPorReportado(Number(id_reportado));
        } else if (status) {
            data = await ReporteController.listarPorStatus(status);
        } else {
            data = await ReporteController.listar();
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao buscar reportes' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/reporte
 * Cria um novo reporte.
 *
 * Body obrigatório:
 * {
 *   id_usuario_reportou: number,
 *   id_usuario_reportado: number,
 *   assunto: string,
 *   tipo_problema: string,
 *   descricao: string,
 *   arquivo?: string       ← URL do arquivo/imagem de evidência (opcional)
 * }
 *
 * tipo_problema válidos:
 *   comportamento_inapropriado | fraude | spam |
 *   servico_nao_realizado | dados_falsos | outro
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (
            !body.id_usuario_reportou ||
            !body.id_usuario_reportado ||
            !body.assunto ||
            !body.tipo_problema ||
            !body.descricao
        ) {
            return NextResponse.json(
                {
                    error: 'Campos obrigatórios: id_usuario_reportou, id_usuario_reportado, assunto, tipo_problema, descricao',
                },
                { status: 400 }
            );
        }

        const id = await ReporteController.criar({
            id_usuario_reportou:  body.id_usuario_reportou,
            id_usuario_reportado: body.id_usuario_reportado,
            assunto:              body.assunto,
            arquivo:              body.arquivo,
            tipo_problema:        body.tipo_problema,
            descricao:            body.descricao,
        });

        return NextResponse.json(
            { id_reporte: id, message: 'Reporte criado com sucesso' },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro interno' },
            { status: 400 }
        );
    }
}
