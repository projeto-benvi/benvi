import { NextResponse } from "next/server";
import { AgendaController } from "@/controller/agendaController";

const controller = new AgendaController();

export async function GET() {

    try {

        const agendas = await controller.listar();

        return NextResponse.json(agendas);

    } catch (error) {

        return NextResponse.json(
            { erro: "Erro ao listar agendas" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {

    try {

        const body = await req.json();

        const id = await controller.criar(body);

        return NextResponse.json(
            { id_agenda: id },
            { status: 201 }
        );

    } catch (error) {

        return NextResponse.json(
            { erro: "Erro ao criar agenda" },
            { status: 500 }
        );
    }
}