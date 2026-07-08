"use client";

import Image from "next/image";
import { useRouter } from "next/navigation"; 
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

import iconSearch from "@/assets/icons/search.svg";
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
        .then(dados => {
          if (ativo) setNotificacoes(Array.isArray(dados) ? dados.slice(0, 5) : []);
        })
        .catch(() => {
          if (ativo) setNotificacoes([]);
        });
    };

    carregarNotificacoes();
    const intervalo = window.setInterval(carregarNotificacoes, 15000);

    return () => {
      ativo = false;
      window.clearInterval(intervalo);
    };
  }, [usuarioLogado?.id]);

  const totalNaoLidas = notificacoes.filter(n => !n.visualizada).length;

  const marcarComoLida = async (notificacao: Notificacao) => {
    await fetch(`/api/notificacao/${notificacao.id_notificacao}`, { method: "PATCH" });
    setNotificacoes(prev =>
      prev.map(n => n.id_notificacao === notificacao.id_notificacao ? { ...n, visualizada: true } : n)
    );

    if (notificacao.url_acao) {
      router.push(resolveNotificationTarget(notificacao.url_acao));
    }
  };

  const lidarComRedirecionamentoPerfil = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session || !usuarioLogado) {
      router.push("/login");
      return;
    }
    if (usuarioLogado.isPrestador) {
      router.push(`/perfil/prestador/${usuarioLogado.id}`);
    } else {
      router.push("/perfil/usuario");
    }
  };

  return (
    <div className="w-full bg-white">
      <header className="border-b-2 border-gray-100 h-20 flex items-center justify-between px-10">
        
        <div className="flex items-center border border-gray-200 rounded-xl h-11 shadow-sm w-full max-w-[440px] bg-white group focus-within:border-blue-500 transition-all">
          <div className="pl-3 pr-2 flex items-center justify-center text-gray-400">
            <Image src={iconSearch} alt="Buscar" width={18} height={18} />
          </div>
          <input 
            type="text" 
            placeholder="Buscar serviços..."
            aria-label="Buscar serviços"
            className="flex-1 h-full text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
          <button 
            type="button" 
            aria-label="Abrir filtros de busca"
            className="px-3 border-l border-gray-200 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <Image src={iconFilter} alt="Filtro" width={18} height={18} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          
          <div className="relative flex items-center"> 
            <details className="relative inline-block text-left group">
              <summary className="flex items-center cursor-pointer list-none p-2 hover:bg-gray-50 rounded-full transition-colors relative">
                <Image src={iconNotification} alt="Notificações" width={22} height={22} />
                {totalNaoLidas > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                    {totalNaoLidas}
                  </span>
                )} 
              </summary>

              <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Notificações
                  </h4>
                  <Link href="/notificacoes" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition">
                    Ver todas
                  </Link>
                </div>
                
                {notificacoes.length === 0 ? (
                  <div className="py-6 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-medium text-gray-500">
                      Nada para ver por aqui...
                    </p>
                  </div>
                ) : (
                  <ul className="flex flex-col divide-y divide-gray-50">
                    {notificacoes.map((notif) => (
                      <li
                        key={notif.id_notificacao}
                        onClick={() => marcarComoLida(notif)}
                        className={`flex items-start gap-3 py-3 px-1 cursor-pointer hover:bg-gray-50 rounded-lg transition ${!notif.visualizada ? "bg-blue-50/40" : ""}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs text-gray-800 truncate ${!notif.visualizada ? "font-bold" : "font-medium"}`}>
                            {notif.titulo}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">{notif.descricao}</p>
                        </div>
                        {!notif.visualizada && (
                          <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
          </div>

          <div className="flex flex-col text-right select-none">
            <span className="text-sm font-semibold text-gray-800 leading-tight">
              Olá, <span className="font-bold">{nomeUsuario}</span>
            </span>
            <span className="text-xs text-gray-400 font-medium">{subTitulo}</span>
          </div>

          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 relative shrink-0">
            {usuarioLogado?.image || usuarioLogado?.foto_perfil ? (
              <Image
                src={usuarioLogado.image || usuarioLogado.foto_perfil}
                alt={`Foto de ${nomeUsuario}`}
                fill
                className="object-cover"
                unoptimized={(usuarioLogado.image || usuarioLogado.foto_perfil).startsWith("http")} 
              />
            ) : (
              <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold uppercase select-none">
                {nomeUsuario.charAt(0)}
              </div>
            )}
          </div>

          <div className="relative flex items-center">
            <details className="relative inline-block text-left group">
              <summary className="flex items-center cursor-pointer list-none text-xs text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-[10px] transform group-open:rotate-180 transition-transform block">▼</span>
              </summary>

              <ul className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                <li>
                  <button 
                    onClick={lidarComRedirecionamentoPerfil}
                    className="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Image src={iconPerfil} alt="icon perfil" className="mr-2.5" width={18} height={18} />
                    Meu perfil
                  </button>
                </li>
                <li>
                  <Link href="/tela-configuracoes" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-50">
                    <Image src={iconConfig} alt="icon configurações" className="mr-2.5" width={18} height={18} />
                    Configurações
                  </Link>
                </li>
              </ul>
            </details>
          </div>

        </div>
      </header>
    </div>
  );
}