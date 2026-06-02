import { usuarioService } from "@/service/usuarioService";
import { NextRequest, NextResponse } from "next/server";

// ── Dados mockados (enquanto não existem tabelas de servico/agendamento) ──

const MOCK_RESUMO = {
  agendamentosHoje: 5,
  avaliacaoMedia: 4.8,
  servicosConcluidos: 128,
};

const MOCK_SERVICOS_RECENTES = [
  {
    titulo: "Reparo de encanamento",
    cliente: "Maria Oliveira",
    data: "Hoje, 09:00",
    status: "Concluído",
    tipoIcone: "droplets",
  },
  {
    titulo: "Instalação elétrica",
    cliente: "João Silva",
    data: "Hoje, 11:00",
    status: "Em andamento",
    tipoIcone: "zap",
  },
  {
    titulo: "Pintura residencial",
    cliente: "Ana Costa",
    data: "Amanhã, 14:00",
    status: "Pendente",
    tipoIcone: "paintbrush",
  },
  {
    titulo: "Manutenção geral",
    cliente: "Pedro Santos",
    data: "03/06, 10:00",
    status: "Confirmado",
    tipoIcone: "wrench",
  },
];

const MOCK_AGENDA_HOJE = [
  {
    horario: "09:00",
    servico: "Manutenção de vazamento",
    endereco: "Rua das Flores, 123",
    status: "Concluído",
  },
  {
    horario: "10:30",
    servico: "Instalação de chuveiro",
    endereco: "Av. Brasil, 456",
    status: "Concluído",
  },
  {
    horario: "13:00",
    servico: "Troca de torneira",
    endereco: "Rua Boa Vista, 789",
    status: "Confirmado",
  },
  {
    horario: "15:00",
    servico: "Reparo de tubulação",
    endereco: "Rua Augusta, 321",
    status: "Confirmado",
  },
  {
    horario: "17:00",
    servico: "Desentupimento de pia",
    endereco: "Al. Santos, 654",
    status: "Pendente",
  },
];

// ── Handler GET ─────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { erro: "Parâmetro userId é obrigatório" },
        { status: 400 }
      );
    }

    const id = Number(userId);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { erro: "userId deve ser um número válido" },
        { status: 400 }
      );
    }

    // Busca o usuário real no banco
    const usuario = await usuarioService.buscarPorId(id);

    if (!usuario) {
      return NextResponse.json(
        { erro: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    if (usuario.nivel_acesso !== 2) {
      return NextResponse.json(
        { erro: "Usuário não é um prestador" },
        { status: 403 }
      );
    }

    // Retorna dados reais do usuário + dados mockados de serviços/agenda
    // TODO: Substituir mocks por queries reais quando tabelas forem criadas
    return NextResponse.json({
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        foto_perfil: usuario.foto_perfil,
        cidade: usuario.cidade,
        nivel_acesso: usuario.nivel_acesso,
      },
      resumo: MOCK_RESUMO,
      servicosRecentes: MOCK_SERVICOS_RECENTES,
      agendaHoje: MOCK_AGENDA_HOJE,
    });
  } catch (e) {
    console.error("Erro em GET /api/prestador/me:", e);
    return NextResponse.json(
      { erro: "Erro interno ao buscar dados do prestador" },
      { status: 500 }
    );
  }
}
