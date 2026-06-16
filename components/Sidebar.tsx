"use client";

import Image from "next/image";
import logo from "@/assets/benvi colorido 2.svg";
import { useAuth } from "@/hooks/useAuth"; // Certifique-se de que o caminho aponta para o useAuth.ts isolado
import {
  Home,
  Search,
  MessageCircle,
  Heart,
  Star,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    label: "Início",
    icon: Home,
    active: true,
  },
  {
    label: "Buscar serviços",
    icon: Search,
    active: false,
  },
  {
    label: "Mensagens",
    icon: MessageCircle,
    active: false,
  },
  {
    label: "Favoritos",
    icon: Heart,
    active: false,
  },
  {
    label: "Avaliações",
    icon: Star,
    active: false,
  },
];

export default function Sidebar() {
  // Puxamos os dados da sessão e a função de logout limpa
  const { user, logado, logout } = useAuth();

  return (
    <aside className="w-[250px] min-h-screen bg-white border-r border-gray-200 px-5 py-6 flex flex-col justify-between">
      <div>
        <div className="mb-10">
          <Image
            src={logo}
            alt="Logo Benvi"
            width={135}
            height={45}
            priority
          />
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  item.active
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        {/* Bloco de Perfil do Usuário Logado */}
        {logado && user && (
          <div className="flex items-center gap-3 px-4 py-3 mb-2 border-b border-gray-100 pb-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={`Foto de ${user.nome}`}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                {user.nome.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-gray-700 truncate">
                {user.nome}
              </span>
              <span className="text-xs text-gray-400 truncate">
                {user.email}
              </span>
            </div>
          </div>
        )}

        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition text-left w-full">
          <Settings size={18} />
          Configurações
        </button>

      
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition text-left w-full cursor-pointer"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}