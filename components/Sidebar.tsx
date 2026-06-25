"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "@/assets/benvi colorido 2.svg";
import { useAuth } from "@/hooks/useAuth";
import {
  Home, Search, MessageCircle, Heart, Star, Settings, LogOut,
  X, Menu, Briefcase, CalendarDays, ShoppingBag,
  LayoutDashboard, Users, Wrench, HandHeart, Ticket, Bell, Handshake,
} from "lucide-react";

export default function Sidebar() {
  const { user, logado, logout } = useAuth();
  const [confirmandoSair, setConfirmandoSair] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const pathname = usePathname();

  const obterItensMenu = () => {

    if (user?.isAdmin || pathname.startsWith("/admin")) {
      return [
        { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
        { label: "Usuários", icon: Users, href: "/usuarios" },
        { label: "Prestadores", icon: Wrench, href: "/prestadores" },
        { label: "Vulnerab. social", icon: HandHeart, href: "/vulnerabilidade" },
        { label: "Mensagens", icon: MessageCircle, href: "/mensagens" },
        { label: "Tickets", icon: Ticket, href: "/tickets" },
        { label: "Alertas", icon: Bell, href: "/alertas" },
        { label: "Parcerias", icon: Handshake, href: "/parcerias" },
      ];
    }
    
    if (user?.isPrestador) {
      return [
        { label: "Início", icon: Home, href: "/" },
        { label: "Meus serviços", icon: ShoppingBag, href: "/servicoPrestador" },
        { label: "Mensagens", icon: MessageCircle, href: "/mensagens" },
        { label: "Agendamentos", icon: CalendarDays, href: "/agendamentos" },
        { label: "Avaliações", icon: Star, href: "/avaliacoes" },
      ];
    }

    // Menu Padrão Comercial
    return [
      { label: "Início", icon: Home, href: "/" },
      { label: "Buscar serviços", icon: Search, href: "/buscar" },
      { label: "Mensagens", icon: MessageCircle, href: "/mensagens" },
      { label: "Favoritos", icon: Heart, href: "/favoritos" },
      { label: "Meus pedidos", icon: Briefcase, href: "/meusPedidos" },
    ];
  };

  const menuItems = obterItensMenu();

  // Fecha o menu mobile automaticamente ao mudar de página
  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  return (
    <>
      {/* Botão Hambúrguer para Mobile */}
      <button
        onClick={() => setMenuAberto(true)}
        className="lg:hidden fixed top-5 left-5 z-40 bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition cursor-pointer flex items-center justify-center text-gray-700"
      >
        <Menu size={22} />
      </button>

      {/* Backdrop do menu mobile */}
      {menuAberto && (
        <div onClick={() => setMenuAberto(false)} className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity" />
      )}

      {/* Sidebar Principal */}
      <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 px-5 py-6 flex flex-col justify-between select-none z-50 .w-[250px] transition-transform duration-300 ease-in-out lg:sticky lg:translate-x-0 ${menuAberto ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          <div className="flex items-center justify-between mb-10">
            <Image src={logo} alt="Logo Benvi" width={135} height={45} priority />
            <button onClick={() => setMenuAberto(false)} className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Navegação Dinâmica baseada nos itens filtrados */}
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              
              // Validação de rota ativa precisa cobrir rotas exatas ou subcaminhos
              const isActive = item.href === "/" 
                ? pathname === "/" 
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="flex flex-col gap-2">
          {logado && user && (
            <div className="flex items-center gap-3 px-4 py-3 mb-2 border-b border-gray-100 pb-4">
              {user.avatar ? (
                <img src={user.avatar} alt={user.nome} className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {user.nome?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-gray-700 truncate">{user.nome}</span>
                <span className="text-xs text-gray-400 truncate">
                  {user.isAdmin || pathname.startsWith("/admin") ? "Administrador" : user.email}
                </span>
              </div>
            </div>
          )}

          <Link
            href="/tela-configuracoes"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
              pathname === "/tela-configuracoes" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Settings size={18} />
            Configurações
          </Link>

          {!confirmandoSair ? (
            <button
              onClick={() => setConfirmandoSair(true)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition text-left w-full cursor-pointer"
            >
              <LogOut size={18} />
              Sair
            </button>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-xl p-2 flex flex-col gap-1.5 transition-all">
              <span className="text-[11px] text-red-700 font-bold px-2 pt-1 text-center">Deseja sair?</span>
              <div className="flex gap-1">
                <button onClick={logout} className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-red-700 transition cursor-pointer">Sim</button>
                <button onClick={() => setConfirmandoSair(false)} className="flex-1 bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg hover:bg-gray-300 transition cursor-pointer">Não</button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}