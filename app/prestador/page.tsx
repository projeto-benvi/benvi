"use client";

import { useMemo } from "react";
import Image from "next/image";
import userFallback from "@/assets/user.png";
import {
  CalendarDays,
  Star,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Wrench,
  Droplets,
  Zap,
  Paintbrush,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useDashboardPrestador,
  type DashboardResumo,
  type AgendaItem,
} from "@/hooks/useDashboardPrestador";

// ── Mapa de ícones por tipo (vindo da API) ─────────────────────────────

const iconesPorTipo: Record<string, LucideIcon> = {
  droplets: Droplets,
  zap: Zap,
  paintbrush: Paintbrush,
  wrench: Wrench,
};

// ── Cores de status ────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  Concluído: "bg-emerald-100 text-emerald-700",
  "Em andamento": "bg-blue-100 text-blue-700",
  Confirmado: "bg-blue-100 text-blue-700",
  Pendente: "bg-amber-100 text-amber-700",
};

// ── Cards de resumo (gerados a partir dos dados do hook) ───────────────

interface ResumoCard {
  titulo: string;
  valor: string;
  icone: LucideIcon;
  corTexto: string;
  corFundo: string;
  corIcone: string;
  corBarra: string;
  link: string;
  href: string;
}

function buildResumoCards(resumo: DashboardResumo): ResumoCard[] {
  return [
    {
      titulo: "Agendamentos hoje",
      valor: String(resumo.agendamentosHoje),
      icone: CalendarDays,
      corTexto: "text-blue-600",
      corFundo: "bg-blue-50",
      corIcone: "bg-blue-100",
      corBarra: "bg-blue-500",
      link: "Ver agenda",
      href: "#",
    },
    {
      titulo: "Avaliação média",
      valor: String(resumo.avaliacaoMedia),
      icone: Star,
      corTexto: "text-amber-600",
      corFundo: "bg-amber-50",
      corIcone: "bg-amber-100",
      corBarra: "bg-amber-500",
      link: "Ver todos",
      href: "#",
    },
    {
      titulo: "Serviços concluídos",
      valor: String(resumo.servicosConcluidos),
      icone: CheckCircle2,
      corTexto: "text-emerald-600",
      corFundo: "bg-emerald-50",
      corIcone: "bg-emerald-100",
      corBarra: "bg-emerald-500",
      link: "Ver todos",
      href: "#",
    },
  ];
}

// ── Componente: Skeleton de carregamento ────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex flex-1 min-h-0 animate-pulse">
      <div className="flex-1 px-6 py-8 lg:px-10">
        {/* Saudação skeleton */}
        <div className="mb-8">
          <div className="h-7 w-48 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-72 bg-gray-100 rounded-lg" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-3 w-28 bg-gray-200 rounded mb-3" />
                  <div className="h-8 w-16 bg-gray-200 rounded" />
                </div>
                <div className="w-11 h-11 bg-gray-200 rounded-xl" />
              </div>
              <div className="h-3 w-20 bg-gray-100 rounded mt-4" />
            </div>
          ))}
        </div>

        {/* Serviços skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="h-5 w-36 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="w-10 h-10 bg-gray-200 rounded-xl" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
              </div>
              <div className="h-5 w-20 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Agenda skeleton */}
      <aside className="hidden xl:flex flex-col w-[340px] bg-white border-l border-gray-100">
        <div className="px-6 py-6">
          <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-48 bg-gray-100 rounded mb-6" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 mb-6">
              <div className="w-[10px] h-[10px] bg-gray-200 rounded-full mt-1" />
              <div className="flex-1">
                <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-40 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────────────

export default function PrestadorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading: dashLoading } = useDashboardPrestador(
    user?.id_usuario
  );

  // Memoiza a data formatada para não recalcular a cada render
  const dataFormatada = useMemo(() => {
    return new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }, []);

  // Loading state
  if (authLoading || dashLoading || !data) {
    return <DashboardSkeleton />;
  }

  // Gera os cards a partir dos dados dinâmicos
  const resumoCards = buildResumoCards(data.resumo);

  // Nome do usuário: prioriza dados da API, depois useAuth, depois fallback
  const nomeUsuario = data.usuario.nome || user?.nome || "Prestador";
  const primeiroNome = nomeUsuario.split(" ")[0];

  return (
    <div className="flex flex-1 min-h-0">
      {/* ── Área central ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-gray-50/60 px-6 py-8 lg:px-10">
        {/* Saudação com Avatar Dinâmico */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm flex-shrink-0">
            <Image
              src={data.usuario.foto_perfil || user?.foto_perfil || userFallback}
              alt={`Avatar de ${primeiroNome}`}
              fill
              sizes="56px"
              priority
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Olá, {primeiroNome} 👋
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Aqui está um resumo de suas atividades
            </p>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {resumoCards.map((card) => {
            const Icon = card.icone;
            return (
              <div
                key={card.titulo}
                className="group relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                {/* Barra decorativa no topo */}
                <div
                  className={`absolute top-0 left-6 right-6 h-[3px] rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${card.corBarra}`}
                />

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                      {card.titulo}
                    </p>
                    <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                      {card.valor}
                    </p>
                  </div>
                  <div
                    className={`flex items-center justify-center w-11 h-11 rounded-xl ${card.corIcone} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon size={20} className={card.corTexto} />
                  </div>
                </div>

                <a
                  href={card.href}
                  className={`inline-flex items-center gap-1 mt-4 text-xs font-semibold ${card.corTexto} hover:underline transition-colors`}
                >
                  {card.link}
                  <ChevronRight size={14} />
                </a>
              </div>
            );
          })}
        </div>

        {/* Serviços recentes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">
              Serviços recentes
            </h2>
            <a
              href="#"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              Ver todos
              <ArrowRight size={14} />
            </a>
          </div>

          {data.servicosRecentes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3">
                <Wrench size={22} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Nenhum serviço recente</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                Você ainda não possui serviços registrados em seu histórico recente.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.servicosRecentes.map((servico, idx) => {
                const SIcon =
                  iconesPorTipo[servico.tipoIcone] || Wrench;
                const corStatus =
                  statusColors[servico.status] || "bg-gray-100 text-gray-700";

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/70 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-500">
                      <SIcon size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {servico.titulo}
                      </p>
                      <p className="text-xs text-gray-400">
                        {servico.cliente} · {servico.data}
                      </p>
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap ${corStatus}`}
                    >
                      {servico.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Coluna lateral direita — Agenda ─────────────────── */}
      <aside className="hidden xl:flex flex-col w-[340px] bg-white border-l border-gray-100 overflow-y-auto">
        <div className="px-6 py-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">
            Agenda de hoje
          </h2>
          <p className="text-xs text-gray-400 mb-6">{dataFormatada}</p>

          {/* Timeline vertical */}
          <div className="relative">
            {data.agendaHoje.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3">
                  <CalendarDays size={20} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Sem agendamentos</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Sua agenda está livre para hoje.
                </p>
              </div>
            ) : (
              <>
                {/* Linha vertical contínua */}
                <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gray-200" />

                <div className="flex flex-col gap-6">
                  {data.agendaHoje.map((item: AgendaItem, idx: number) => (
                    <div key={idx} className="relative flex gap-4 group">
                      {/* Dot na timeline */}
                      <div className="relative z-10 flex items-center justify-center">
                        <div
                          className={`w-[10px] h-[10px] rounded-full border-2 transition-all duration-200 ${
                            item.status === "Concluído"
                              ? "bg-emerald-500 border-emerald-500"
                              : item.status === "Confirmado"
                              ? "bg-blue-500 border-blue-500"
                              : "bg-white border-gray-300 group-hover:border-amber-400"
                          }`}
                        />
                      </div>

                      {/* Card do compromisso */}
                      <div className="flex-1 -mt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-900 tabular-nums">
                            {item.horario}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              statusColors[item.status] ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 leading-snug">
                          {item.servico}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin size={12} className="text-gray-400" />
                          <p className="text-[11px] text-gray-400 truncate">
                            {item.endereco}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Link ver agenda completa */}
          <a
            href="#"
            className="flex items-center justify-center gap-2 mt-8 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
          >
            <CalendarDays size={16} />
            Ver agenda completa
          </a>
        </div>
      </aside>
    </div>
  );
}
