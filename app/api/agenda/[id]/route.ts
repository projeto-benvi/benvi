/*
import { NextResponse } from "next/server";
import { AgendaController } from "@/controller/agendaController";

const controller = new AgendaController();

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {

    try {

        const agenda = await controller.buscarPorId(
            Number(params.id)
        );

        if (!agenda) {
            return NextResponse.json(
                { erro: "Agenda não encontrada" },
                { status: 404 }
            );
        }

        return NextResponse.json(agenda);

    } catch (error) {

        return NextResponse.json(
            { erro: "Erro ao buscar agenda" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {

    try {

        const body = await req.json();

        const atualizado = await controller.atualizar(
            Number(params.id),
            body
        );

        return NextResponse.json({
            sucesso: atualizado
        });

    } catch (error) {

        return NextResponse.json(
            { erro: "Erro ao atualizar agenda" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    try {

        const { id } = await params;

        const removido = await controller.remover(
            Number(id)
        );

        return NextResponse.json({
            sucesso: removido
        });

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            { erro: "Erro ao excluir agenda" },
            { status: 500 }
        );
    }
}
    */
import { NextResponse } from "next/server";
import { AgendaController } from "@/controller/agendaController";

const controller = new AgendaController();

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {

        const { id } = await params;

        const agenda = await controller.buscarPorId(
            Number(id)
        );

        if (!agenda) {
            return NextResponse.json(
                { erro: "Agenda não encontrada" },
                { status: 404 }
            );
        }

        return NextResponse.json(agenda);

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            { erro: "Erro ao buscar agenda" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {

        const { id } = await params;

        const body = await req.json();

        const atualizado = await controller.atualizar(
            Number(id),
            body
        );

        return NextResponse.json({
            sucesso: atualizado
        });

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            { erro: "Erro ao atualizar agenda" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {

        const { id } = await params;

        const removido = await controller.remover(
            Number(id)
        );

        return NextResponse.json({
            sucesso: removido
        });

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            { erro: "Erro ao excluir agenda" },
            { status: 500 }
        );
    }
}