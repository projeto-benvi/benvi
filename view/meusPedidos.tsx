"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import SearchBar from "@/components/searchBar";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  MapPin,
  CalendarDays,
  MessageCircle,
  Wrench,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  X,
  Search,
  Star,
} from "lucide-react";

interface Pedido {
  id_solicitacao: number;
  id_usuario: number;
  id_prestador: number;
  endereco?: string;
  data_solicitacao: string;
  data_agendamento?: string;
  status: boolean;
  descricao_servico?: string;
  complemento: string;
  nome_prestador: string;
  foto_prestador?: string;
  categoria_principal?: string;
}

type FiltroStatus = "todos" | "pendente" | "concluido";

const formatarData = (dataISO?: string) => {
  if (!dataISO) return "—";
  return new Date(dataISO).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatarDataHora = (dataISO?: string) => {
  if (!dataISO) return "—";
  return new Date(dataISO).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MeusPedidos() {
  const { user, logado } = useAuth();
  const router = useRouter();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<FiltroStatus>("todos");
  const [busca, setBusca] = useState("");
  const [pedidoDetalhes, setPedidoDetalhes] = useState<Pedido | null>(null);

  const [pedidoParaAvaliar, setPedidoParaAvaliar] = useState<Pedido | null>(null);
  const [notaGeral, setNotaGeral] = useState(5);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState("");
  const [notasCriterios, setNotasCriterios] = useState({
    comunicacao: 5,
    respeito: 5,
    pontualidade: 5,
    acordo: 5,
  });
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [avaliacoesEnviadas, setAvaliacoesEnviadas] = useState<number[]>([]);

  const carregarPedidos = useCallback(async () => {
    if (!user?.id) return;
    setCarregando(true);
    try {
      const res = await fetch(`/api/solicitacaoservico?id_usuario=${user.id}`);
      if (!res.ok) throw new Error("Erro ao buscar pedidos");
      const dados = await res.json();
      const lista = Array.isArray(dados) ? dados : Array.isArray(dados?.dados) ? dados.dados : [];
      setPedidos(lista);
    } catch (err) {
      console.error(err);
      setPedidos([]);
    } finally {
      setCarregando(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (logado && user?.id) {
      carregarPedidos();
    } else if (!logado) {
      setCarregando(false);
    }
  }, [logado, user?.id, carregarPedidos]);

  const abrirModalAvaliar = (pedido: Pedido) => {
    setPedidoParaAvaliar(pedido);
    setNotaGeral(5);
    setComentarioAvaliacao("");
    setNotasCriterios({ comunicacao: 5, respeito: 5, pontualidade: 5, acordo: 5 });
  };

  const enviarAvaliacao = async () => {
    if (!pedidoParaAvaliar || !user?.id) return;

    setEnviandoAvaliacao(true);
    try {
      const res = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: Number(user.id),
          id_prestador: pedidoParaAvaliar.id_prestador,
          id_servico: pedidoParaAvaliar.id_solicitacao,
          nota_geral: notaGeral,
          comentario: comentarioAvaliacao.trim(),
          comunicacao: notasCriterios.comunicacao,
          respeito: notasCriterios.respeito,
          pontualidade: notasCriterios.pontualidade,
          acordo: notasCriterios.acordo,
        }),
      });

      const dados = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(dados?.error || "Não foi possível enviar a avaliação.");
      }

      setAvaliacoesEnviadas((prev) => [...prev, pedidoParaAvaliar.id_solicitacao]);
      setPedidoParaAvaliar(null);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Erro ao enviar avaliação.");
    } finally {
      setEnviandoAvaliacao(false);
    }
  };

  const RenderEstrelas = ({
    valorAtual,
    onChange,
  }: {
    valorAtual: number;
    onChange: (v: number) => void;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((estrela) => (
        <button
          key={estrela}
          type="button"
          onClick={() => onChange(estrela)}
          className="cursor-pointer transition-transform hover:scale-110"
        >
          <Star
            size={20}
            className={estrela <= valorAtual ? "fill-amber-400 text-amber-400" : "text-gray-300"}
          />
        </button>
      ))}
    </div>
  );

  const pedidosFiltrados = pedidos.filter((p) => {
    const matchFiltro =
      filtro === "todos" ||
      (filtro === "pendente" && !p.status) ||
      (filtro === "concluido" && p.status);

    const matchBusca =
      busca.trim() === "" ||
      p.nome_prestador?.toLowerCase().includes(busca.toLowerCase()) ||
      p.complemento?.toLowerCase().includes(busca.toLowerCase()) ||
      p.categoria_principal?.toLowerCase().includes(busca.toLowerCase());

    return matchFiltro && matchBusca;
  });

  const contagens = {
    todos: pedidos.length,
    pendente: pedidos.filter((p) => !p.status).length,
    concluido: pedidos.filter((p) => p.status).length,
  };

  const StatusBadge = ({ status }: { status: boolean }) =>
    status ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle2 size={12} /> Concluído
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        <Clock size={12} /> Pendente
      </span>
    );

  if (!logado) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <AlertCircle size={48} className="text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Faça login para ver seus pedidos</h2>
          <p className="text-gray-500 mb-6">Você precisa estar autenticado para acessar esta página.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition cursor-pointer"
          >
            Ir para o Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <SearchBar />

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <ClipboardList size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Meus Pedidos</h1>
              <p className="text-xs text-gray-500">Acompanhe suas solicitações de serviço</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={busca}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusca(e.target.value)}
                placeholder="Buscar por prestador ou serviço..."
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 w-64"
              />
            </div>
            <button
              onClick={carregarPedidos}
              disabled={carregando}
              className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer"
              title="Atualizar"
            >
              <RefreshCw size={16} className={carregando ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <ClipboardList size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{contagens.todos}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{contagens.pendente}</p>
              <p className="text-xs text-gray-500">Pendentes</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{contagens.concluido}</p>
              <p className="text-xs text-gray-500">Concluídos</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5">
          {(["todos", "pendente", "concluido"] as FiltroStatus[]).map((f) => {
            const labels: Record<FiltroStatus, string> = {
              todos: "Todos",
              pendente: "Pendentes",
              concluido: "Concluídos",
            };
            return (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  filtro === f
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {labels[f]}
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  filtro === f ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {contagens[f]}
                </span>
              </button>
            );
          })}
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-blue-400 animate-spin" />
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <ClipboardList size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-1">
              {busca ? "Nenhum pedido encontrado" : "Você ainda não fez nenhum pedido"}
            </h3>
            <p className="text-sm text-gray-400">
              {busca
                ? "Tente ajustar sua busca."
                : "Explore nossos prestadores e solicite um serviço!"}
            </p>
            {!busca && (
              <button
                onClick={() => router.push("/buscar")}
                className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition cursor-pointer"
              >
                Buscar prestadores
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pedidosFiltrados.map((pedido) => (
              <div
                key={pedido.id_solicitacao}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    {pedido.foto_prestador ? (
                      <img
                        src={pedido.foto_prestador}
                        alt={pedido.nome_prestador}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-base font-bold">
                        {pedido.nome_prestador?.charAt(0).toUpperCase() ?? "P"}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{pedido.nome_prestador}</p>
                      {pedido.categoria_principal && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Wrench size={11} className="text-gray-400" />
                          <p className="text-xs text-gray-400">{pedido.categoria_principal}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={pedido.status} />
                    <button
                      onClick={() => setPedidoDetalhes(pedido)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                    >
                      <Eye size={13} /> Ver detalhes
                    </button>
                    <button
                      onClick={() => router.push("/mensagens")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                    >
                      <MessageCircle size={13} /> Mensagem
                    </button>
                    {pedido.status && !avaliacoesEnviadas.includes(pedido.id_solicitacao) && (
                      <button
                        onClick={() => abrirModalAvaliar(pedido)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-600 hover:bg-amber-100 transition cursor-pointer"
                      >
                        <Star size={13} /> Avaliar
                      </button>
                    )}
                    {pedido.status && avaliacoesEnviadas.includes(pedido.id_solicitacao) && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-50 text-green-600">
                        <Star size={13} className="fill-green-600" /> Avaliado
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="flex items-start gap-2">
                    <CalendarDays size={14} className="text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Solicitado em</p>
                      <p className="text-xs font-medium text-gray-700">{formatarData(pedido.data_solicitacao)}</p>
                    </div>
                  </div>

                  {pedido.data_agendamento && (
                    <div className="flex items-start gap-2">
                      <CalendarDays size={14} className="text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Agendado para</p>
                        <p className="text-xs font-medium text-gray-700">{formatarData(pedido.data_agendamento)}</p>
                      </div>
                    </div>
                  )}

                  {pedido.endereco && (
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Endereço</p>
                        <p className="text-xs font-medium text-gray-700 truncate max-w-[180px]">{pedido.endereco}</p>
                      </div>
                    </div>
                  )}
                </div>

                {pedido.complemento && (
                  <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 line-clamp-2">
                    {pedido.complemento}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detalhes */}
      {pedidoDetalhes && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setPedidoDetalhes(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ClipboardList size={18} className="text-blue-600" />
                <h2 className="font-bold text-gray-800 text-base">
                  Pedido #{pedidoDetalhes.id_solicitacao}
                </h2>
              </div>
              <button
                onClick={() => setPedidoDetalhes(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {pedidoDetalhes.foto_prestador ? (
                  <img
                    src={pedidoDetalhes.foto_prestador}
                    alt={pedidoDetalhes.nome_prestador}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">
                    {pedidoDetalhes.nome_prestador?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800">{pedidoDetalhes.nome_prestador}</p>
                  {pedidoDetalhes.categoria_principal && (
                    <p className="text-xs text-gray-500">{pedidoDetalhes.categoria_principal}</p>
                  )}
                </div>
                <div className="ml-auto">
                  <StatusBadge status={pedidoDetalhes.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Solicitado em</p>
                  <p className="text-sm font-medium text-gray-700">{formatarDataHora(pedidoDetalhes.data_solicitacao)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Agendado para</p>
                  <p className="text-sm font-medium text-gray-700">{formatarData(pedidoDetalhes.data_agendamento)}</p>
                </div>
              </div>

              {pedidoDetalhes.endereco && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin size={12} className="text-red-400" />
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Endereço</p>
                  </div>
                  <p className="text-sm text-gray-700">{pedidoDetalhes.endereco}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Descrição / Complemento</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{pedidoDetalhes.complemento}</p>
              </div>

              {pedidoDetalhes.descricao_servico && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-[10px] text-blue-500 uppercase font-semibold mb-1">Serviço solicitado</p>
                  <p className="text-sm text-blue-800">{pedidoDetalhes.descricao_servico}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end">
              <button
                onClick={() => { setPedidoDetalhes(null); router.push("/mensagens"); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition cursor-pointer"
              >
                <MessageCircle size={15} /> Enviar mensagem
              </button>
              <button
                onClick={() => setPedidoDetalhes(null)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Avaliar */}
      {pedidoParaAvaliar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => !enviandoAvaliacao && setPedidoParaAvaliar(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-base">
                Avaliar {pedidoParaAvaliar.nome_prestador}
              </h2>
              <button
                onClick={() => setPedidoParaAvaliar(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">
                  Como você avalia esse serviço?
                </label>
                <div className="flex items-center gap-3">
                  <RenderEstrelas valorAtual={notaGeral} onChange={setNotaGeral} />
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                    {notaGeral === 5 ? "Excelente!" : notaGeral === 4 ? "Muito bom" : notaGeral === 3 ? "Regular" : notaGeral === 2 ? "Ruim" : "Péssimo"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-gray-500 text-xs">Comentário (opcional)</span>
                <textarea
                  value={comentarioAvaliacao}
                  onChange={(e) => setComentarioAvaliacao(e.target.value.slice(0, 500))}
                  placeholder="Conte como foi sua experiência com este prestador..."
                  className="w-full min-h-[90px] bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-amber-400 focus:bg-white transition resize-none"
                />
                <div className="text-right text-[10px] text-gray-400">{comentarioAvaliacao.length}/500</div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700">Avalie também os aspectos do serviço</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { chave: "comunicacao" as const, label: "Comunicação" },
                    { chave: "respeito" as const, label: "Respeito" },
                    { chave: "pontualidade" as const, label: "Pontualidade" },
                    { chave: "acordo" as const, label: "Acordo" },
                  ].map(({ chave, label }) => (
                    <div key={chave} className="border border-gray-100 rounded-xl p-3 flex flex-col gap-1 bg-white shadow-sm">
                      <span className="text-[11px] font-bold text-gray-600">{label}</span>
                      <div className="flex items-center justify-between mt-1">
                        <RenderEstrelas
                          valorAtual={notasCriterios[chave]}
                          onChange={(v) => setNotasCriterios((p) => ({ ...p, [chave]: v }))}
                        />
                        <span className="text-[11px] font-bold text-gray-500">{notasCriterios[chave].toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setPedidoParaAvaliar(null)}
                disabled={enviandoAvaliacao}
                className="px-5 py-2 border border-gray-300 bg-white text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={enviarAvaliacao}
                disabled={enviandoAvaliacao}
                className="px-6 py-2 bg-amber-500 text-white font-semibold text-xs rounded-xl hover:bg-amber-600 shadow-md transition cursor-pointer disabled:opacity-60"
              >
                {enviandoAvaliacao ? "Enviando..." : "Enviar avaliação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
