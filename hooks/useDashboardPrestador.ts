import { useState, useEffect } from "react";

// ── Tipos de resposta da API ────────────────────────────────────────────

export interface DashboardUsuario {
  id_usuario?: number;
  nome?: string;
  email: string;
  foto_perfil?: string;
  cidade?: string;
  nivel_acesso?: number;
}

export interface DashboardResumo {
  agendamentosHoje: number;
  avaliacaoMedia: number;
  servicosConcluidos: number;
}

export interface ServicoRecente {
  titulo: string;
  cliente: string;
  data: string;
  status: string;
  tipoIcone: string;
}

export interface AgendaItem {
  horario: string;
  servico: string;
  endereco: string;
  status: "Concluído" | "Confirmado" | "Pendente";
}

export interface DashboardPrestadorData {
  usuario: DashboardUsuario;
  resumo: DashboardResumo;
  servicosRecentes: ServicoRecente[];
  agendaHoje: AgendaItem[];
}

// ── Dados de fallback para desenvolvimento ──────────────────────────────

const FALLBACK_DATA: DashboardPrestadorData = {
  usuario: {
    email: "prestador@benvi.com",
    nivel_acesso: 2,
  },
  resumo: {
    agendamentosHoje: 5,
    avaliacaoMedia: 4.8,
    servicosConcluidos: 128,
  },
  servicosRecentes: [
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
  ],
  agendaHoje: [
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
  ],
};

// ── Hook ────────────────────────────────────────────────────────────────

export function useDashboardPrestador(userId: number | undefined) {
  const [data, setData] = useState<DashboardPrestadorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sem userId → usa fallback imediato
    if (!userId) {
      setData(FALLBACK_DATA);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchDashboard() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/prestador/me?userId=${userId}`);

        if (!res.ok) {
          // API retornou erro — usar fallback e registrar
          const body = await res.json().catch(() => ({}));
          console.warn("API /api/prestador/me retornou erro:", body);
          if (!cancelled) {
            setData(FALLBACK_DATA);
            setError(body.erro || "Erro ao carregar dados do dashboard");
          }
          return;
        }

        const json: DashboardPrestadorData = await res.json();
        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        console.error("Erro na chamada do dashboard:", err);
        if (!cancelled) {
          setData(FALLBACK_DATA);
          setError("Não foi possível conectar à API");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { data, loading, error };
}
