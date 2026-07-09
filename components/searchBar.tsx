"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

import iconFilter from "@/assets/icons/filter-alt-2.svg";
import iconNotification from "@/assets/icons/notification.svg";
import iconPerfil from "@/assets/comSearchBar/nft-profile.svg";
import iconConfig from "@/assets/comSearchBar/iconConfig.svg";
import { resolveNotificationTarget } from "@/app/lib/internal-navigation";

interface Notificacao {
  id_notificacao: number;
  titulo: string;
  descricao: string;
  visualizada: boolean;
  data_envio: string;
  url_acao?: string;
  tipo?: string;
}

export default function SearchBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  const usuarioLogado = session?.user as any;
  const nomeUsuario = usuarioLogado?.name || usuarioLogado?.nome || "Visitante";

  const subTitulo = usuarioLogado?.isAdmin
    ? "Administrador 🛡️"
    : usuarioLogado?.isPrestador
      ? "Prestador 🛠️"
      : "Cliente";

  useEffect(() => {
    if (!usuarioLogado?.id) return;
    let ativo = true;
    const carregarNotificacoes = () => {
      fetch(`/api/notificacao?id_usuario=${usuarioLogado.id}`, { cache: "no-store" })
        .then(res => res.json())
        .then(dados => { if (ativo) setNotificacoes(Array.isArray(dados) ? dados.slice(0, 5) : []); })
        .catch(() => { if (ativo) setNotificacoes([]); });
    };
    carregarNotificacoes();
    const intervalo = window.setInterval(carregarNotificacoes, 15000);
    return () => { ativo = false; window.clearInterval(intervalo); };
  }, [usuarioLogado?.id]);

  const totalNaoLidas = notificacoes.filter(n => !n.visualizada).length;

  const marcarComoLida = async (notificacao: Notificacao) => {
    await fetch(`/api/notificacao/${notificacao.id_notificacao}`, { method: "PATCH" });
    setNotificacoes(prev =>
      prev.map(n => n.id_notificacao === notificacao.id_notificacao ? { ...n, visualizada: true } : n)
    );
    if (notificacao.url_acao) router.push(resolveNotificationTarget(notificacao.url_acao));
  };

  const lidarComRedirecionamentoPerfil = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session || !usuarioLogado) { router.push("/login"); return; }
    if (usuarioLogado.isPrestador) router.push(`/perfil/prestador/${usuarioLogado.id}`);
    else router.push("/perfil/usuario");
  };

  return (
    <div className="w-full bg-white border-b-2 border-gray-100">
      <header className="h-20 flex items-center justify-between px-4 md:px-10 gap-2 md:gap-4">
        
        {/* Campo de Busca */}
        <div className="flex items-center flex-1 min-w-0 max-w-[500px] ml-14 lg:ml-0">
          {/* Caixa de Busca */}
          <div className="flex items-center border border-gray-200 rounded-xl h-11 flex-1 min-w-0 bg-white group focus-within:border-blue-500 transition-all">
            <div className="pl-3 pr-1 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar serviços..."
              className="flex-1 h-full text-sm text-gray-700 outline-none placeholder:text-gray-400 bg-transparent pl-1 pr-2"
            />
            <button type="button" className="px-3 border-l border-gray-200 h-6 flex items-center justify-center hover:opacity-70 transition-opacity">
              <Image src={iconFilter} alt="Filtro" width={18} height={18} />
            </button>
          </div>
        </div>

        {/* Área de Usuário */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="relative flex items-center">
            <details className="relative inline-block text-left group">
              <summary className="flex items-center cursor-pointer list-none p-2 hover:bg-gray-50 rounded-full relative">
                <Image src={iconNotification} alt="Notificações" width={22} height={22} />
                {totalNaoLidas > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">{totalNaoLidas}</span>}
              </summary>
              <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Notificações</h4>
                  <Link href="/notificacoes" className="text-[11px] font-bold text-blue-600 hover:underline">Ver todas</Link>
                </div>
                {notificacoes.length === 0 ? <p className="text-sm text-gray-500 text-center py-2">Nada por aqui...</p> : 
                  <ul className="flex flex-col gap-3">
                    {notificacoes.map(n => (
                      <li key={n.id_notificacao} className="border-b border-gray-50 pb-2 last:border-0">
                        <p className="text-xs font-bold text-gray-800">{n.titulo}</p>
                        <p className="text-[11px] text-gray-400">{n.descricao}</p>
                      </li>
                    ))}
                  </ul>
                }
              </div>
            </details>
          </div>

          <div className="hidden md:flex flex-col text-right select-none">
            <span className="text-sm font-semibold text-gray-800 leading-tight">Olá, <span className="font-bold">{nomeUsuario}</span></span>
            <span className="text-xs text-gray-400 font-medium">{subTitulo}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border border-gray-200 relative shrink-0">
              {usuarioLogado?.image || usuarioLogado?.foto_perfil ? (
                <Image src={usuarioLogado.image || usuarioLogado.foto_perfil} alt="Foto" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold uppercase">{nomeUsuario.charAt(0)}</div>
              )}
            </div>
            <details className="relative">
              <summary className="flex items-center cursor-pointer list-none text-xs text-gray-400 p-1">▼</summary>
              <ul className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1">
                <li><button onClick={lidarComRedirecionamentoPerfil} className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-gray-50">Meu perfil</button></li>
                <li><Link href="/tela-configuracoes" className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 border-t border-gray-100">Configurações</Link></li>
              </ul>
            </details>
          </div>
        </div>
      </header>
    </div>
  );
}