import { NextRequest, NextResponse } from 'next/server';
import { ReporteController } from '@/controller/reporteController';
import { authErrorResponse, requireAdmin, requireResourceOwner, requireUser } from '@/app/lib/authz';

export async function GET(request: NextRequest) {
    try {
        const user = await requireUser();
        const { searchParams } = new URL(request.url);
        const id_reportou  = searchParams.get('id_reportou');
        const id_reportado = searchParams.get('id_reportado');
        const status       = searchParams.get('status');

        let data;

        if (id_reportou) {
            requireResourceOwner(user, id_reportou);
            data = await ReporteController.listarPorReportou(Number(id_reportou));
        } else if (id_reportado) {
            requireResourceOwner(user, id_reportado);
            data = await ReporteController.listarPorReportado(Number(id_reportado));
        } else if (status) {
            await requireAdmin();
            data = await ReporteController.listarPorStatus(status);
        } else {
            await requireAdmin();
            data = await ReporteController.listar();
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) return authResponse;

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao buscar reportes' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await requireUser();
        const body = await request.json();

        if (
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

        if (body.arquivo || body.anexo || body.documento || body.comprovante) {
            return NextResponse.json(
                { error: 'Upload de documentos privados depende de storage privado e ainda nao esta habilitado.' },
                { status: 503 }
            );
        }
        const id = await ReporteController.criar({
            id_usuario_reportou:  user.id,
            id_usuario_reportado: body.id_usuario_reportado,
            assunto:              body.assunto,
            arquivo:              undefined,
            tipo_problema:        body.tipo_problema,
            descricao:            body.descricao,
        });

        return NextResponse.json(
            { id_reporte: id, message: 'Reporte criado com sucesso' },
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


