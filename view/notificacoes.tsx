"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Check, MessageSquare, Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { resolveNotificationTarget } from "@/app/lib/internal-navigation";

interface Notificacao {
  id_notificacao: number;
  id_usuario: number;
  titulo: string;
  descricao: string;
  visualizada: boolean;
  data_envio: string;
  url_acao?: string;
  tipo?: string;
}

type Filtro = "todas" | "nao_lidas" | "mensagens";

export default function NotificacoesView() {
  const { user } = useAuth();
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const buscarNotificacoes = async () => {
    if (!user?.id) return;
    setCarregando(true);
    try {
      const res = await fetch(`/api/notificacao?id_usuario=${user.id}`);
      const dados = await res.json();
      const lista = Array.isArray(dados) ? dados : Array.isArray(dados?.dados) ? dados.dados : [];
      setNotificacoes(lista);
    } catch {
      setNotificacoes([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarNotificacoes();
  }, [user]);

  const marcarComoLida = async (id: number) => {
    await fetch(`/api/notificacao/${id}`, { method: "PATCH" });
    setNotificacoes(prev =>
      prev.map(n => n.id_notificacao === id ? { ...n, visualizada: true } : n)
    );
  };

  const abrirNotificacao = async (notificacao: Notificacao) => {
    if (!notificacao.visualizada) await marcarComoLida(notificacao.id_notificacao);
    router.push(resolveNotificationTarget(notificacao.url_acao));
  };

  const marcarTodasComoLidas = async () => {
    const naoLidas = notificacoes.filter(n => !n.visualizada);
    await Promise.all(naoLidas.map(n => fetch(`/api/notificacao/${n.id_notificacao}`, { method: "PATCH" })));
    setNotificacoes(prev => prev.map(n => ({ ...n, visualizada: true })));
  };

  const deletar = async (id: number) => {
    await fetch(`/api/notificacao/${id}`, { method: "DELETE" });
    setNotificacoes(prev => prev.filter(n => n.id_notificacao !== id));
  };

  const formatarTempo = (data: string) => {
    const agora = new Date();
    const envio = new Date(data);
    const diff = Math.floor((agora.getTime() - envio.getTime()) / 1000);
    if (diff < 60) return "agora mesmo";
    if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
  };

  const isMensagem = (titulo: string) =>
    titulo.toLowerCase().includes("mensagem") || titulo.toLowerCase().includes("chat");

  const notificacoesFiltradas = notificacoes.filter(n => {
    if (filtro === "nao_lidas") return !n.visualizada;
    if (filtro === "mensagens") return isMensagem(n.titulo);
    return true;
  });

  const totalNaoLidas = notificacoes.filter(n => !n.visualizada).length;
  const totalMensagens = notificacoes.filter(n => isMensagem(n.titulo)).length;

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Bell size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {totalNaoLidas > 0 ? `${totalNaoLidas} não lida${totalNaoLidas > 1 ? "s" : ""}` : "Tudo em dia"}
            </p>
          </div>
        </div>
        {totalNaoLidas > 0 && (
          <button
            onClick={marcarTodasComoLidas}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
          >
            <Check size={14} />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "todas", label: "Todas" },
          { id: "nao_lidas", label: "Não Lidas", count: totalNaoLidas },
          { id: "mensagens", label: "Mensagens", count: totalMensagens },
        ].map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setFiltro(id as Filtro)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition cursor-pointer ${
              filtro === id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
            }`}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                filtro === id ? "bg-white text-blue-600" : "bg-blue-100 text-blue-600"
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {carregando ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            Carregando notificações...
          </div>
        ) : notificacoesFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center">
              <Bell size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">Nenhuma notificação aqui</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notificacoesFiltradas.map((n) => (
              <div
                key={n.id_notificacao}
                role="link"
                tabIndex={0}
                onClick={() => abrirNotificacao(n)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") abrirNotificacao(n);
                }}
                className={`flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition group ${
                  !n.visualizada ? "bg-blue-50/30" : ""
                }`}
              >
                {/* Ícone */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isMensagem(n.titulo) ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                }`}>
                  {isMensagem(n.titulo) ? <MessageSquare size={18} /> : <Settings size={18} />}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold text-gray-800 ${!n.visualizada ? "font-bold" : ""}`}>
                    {n.titulo}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{n.descricao}</p>
                </div>

                {/* Direita */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[11px] text-gray-400">{formatarTempo(n.data_envio)}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    {!n.visualizada && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          marcarComoLida(n.id_notificacao);
                        }}
                        title="Marcar como lida"
                        className="text-blue-500 hover:text-blue-700 transition cursor-pointer"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        deletar(n.id_notificacao);
                      }}
                      title="Deletar"
                      className="text-gray-400 hover:text-red-500 transition cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {!n.visualizada && (
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {!carregando && notificacoes.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-50 text-center">
            <p className="text-xs text-gray-400">Não há mais notificações para carregar</p>
          </div>
        )}
      </div>
    </div>
  );
}
