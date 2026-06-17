"use client";

import { useState } from "react";
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
  X,
  Check,
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
  
  // Estado para controlar a confirmação de saída
  const [confirmandoSair, setConfirmandoSair] = useState(false);

  return (
    <aside className="w-[250px] min-h-screen bg-white border-r border-gray-200 px-5 py-6 flex flex-col justify-between select-none">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
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
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition cursor-pointer">
          <Settings size={18} />
          Configurações
        </button>

        {/* Lógica do Botão Desdobrável de Confirmação */}
        {!confirmandoSair ? (
          <button 
            onClick={() => setConfirmandoSair(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition text-left w-full cursor-pointer animate-fadeIn"
          >
            <LogOut size={18} />
            Sair
          </button>
        ) : (
          <div className="bg-red-50 border border-red-100 rounded-xl p-2 flex flex-col gap-1.5 transition-all">
            <span className="text-[11px] text-red-700 font-bold px-2 pt-1 text-center">
              Deseja realmente sair?
            </span>
            <div className="flex gap-1">
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-red-700 transition cursor-pointer"
              >
                <Check size={14} />
                Sim
              </button>
              <button
                onClick={() => setConfirmandoSair(false)}
                className="flex-1 flex items-center justify-center gap-1 bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg hover:bg-gray-300 transition cursor-pointer"
              >
                <X size={14} />
                Não
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}