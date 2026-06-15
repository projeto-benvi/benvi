import Form from "next/form"
import Image from "next/image"
import { Bell } from "lucide-react"

import Link from "next/link"; // Mantido para navegação fluida ao perfil

// Importações de assets
import iconSearch from "@/assets/icons/search.svg";
import iconFilter from "@/assets/icons/filter-alt-2.svg";
import iconNotification from "@/assets/icons/notification.svg";
import iconPerfil from "@/assets/comSearchBar/nft-profile.svg";
import iconConfig from "@/assets/comSearchBar/iconConfig.svg";
import userPlaceholder from "@/assets/user.png";

// Hook de autenticação vindo da main
import { useAuth } from '@/hooks/useAuth';

// Interface para silenciar o erro de "Property does not exist"
interface UserCustom {
  nome?: string;
  avatar?: string;
}

export default function SearchBar() {
  // Usamos o 'as' para dizer ao TypeScript: "confie em mim, este objeto tem esses campos"
  const { user: currentUser } = useAuth() as { user: UserCustom | null };

  const nomeUsuario = currentUser?.nome || "Usuário";
  const avatarUsuario = currentUser?.avatar || userPlaceholder.src;
  const notificacoes: string[] = [];

  return (
    <div className="w-full">
      <header className="border-b-gray-200 border-b-2 h-20 flex items-center justify-between px-10">

        {/* Barra de Busca */}
        <div className="flex items-center border-2 border-gray-200 rounded-2xl h-12 shadow-md px-3">
          <Image src={iconSearch} alt="Buscar" width={20} height={20} />
          <input
            type="text"
            className="border-r-2 border-gray-200 px-3 w-80 outline-none"
            placeholder="Buscar serviços..."
          />
          <input type="text" className="w-150 border border-gray-200 rounded-lg outline-none focus:border-blue-400 transition-colors px-2" />
          <Image
            className="px-2"
            src={iconFilter}
            alt={"icon Filter"}
          />

          <div className="flex">
            <button className="cursor-pointer mr-4 hover:text-[#2563EB]">

            </button>
            <div>
              <p>Olá, Pedro</p>
              <p className="text-sm text-[#1F2937] text-right hover:text-[#2563EB] cursor-pointer">Cliente</p>
            </div>

            {/* 2. Bloco do Usuário e Notificações (Lado Direito) */}
            <div className="flex items-center gap-4">

              {/* MENU DROPDOWN DE NOTIFICAÇÕES */}
              <div className="relative flex items-center">
                <details className="relative inline-block text-left group">
                  <summary className="flex items-center cursor-pointer list-none p-2 hover:bg-gray-50 rounded-full transition-colors relative">
                    <Image
                      src={iconNotification}
                      alt="Notificações"
                      width={22}
                      height={22}
                    />
                    {notificacoes.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </summary>

                  {/* Caixa do Dropdown de Notificações */}
                  <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden p-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Notificações
                    </h4>

                    {notificacoes.length === 0 ? (
                      <div className="py-6 flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-medium text-gray-500">
                          Nada para ver por aqui...
                        </p>
                      </div>
                    ) : (
                      <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        {notificacoes.map((notif, index) => (
                          <li key={index} className="text-sm text-gray-600 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            {notif}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </details>
              </div>

              {/* Info Textual Dinâmica do Usuário */}
              <div className="flex flex-col text-right select-none">
                <span className="text-sm font-semibold text-gray-800 leading-tight">
                  Olá, <span className="font-bold">{nomeUsuario}</span>
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Cliente
                </span>
              </div>

              {/* Foto de Perfil Dinâmica */}
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 relative">
                <Image
                  src={avatarUsuario}
                  alt="Foto usuario"
                  fill
                  className="object-cover"
                />

              </div>

              {/* Menu Dropdown de Perfil */}
              <div className="relative flex items-center">
                <details className="relative inline-block text-left group">
                  <summary className="flex items-center cursor-pointer list-none text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    <span className="text-[10px] transform group-open:rotate-180 transition-transform block">
                      ▼
                    </span>
                  </summary>

                  <ul className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                    <li>
                      <Link
                        href="/perfil/usuario"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Image src={iconPerfil} alt="icon perfil" className="mr-2.5" width={18} height={18} />
                        Meu perfil
                      </Link>
                    </li>
                    <li>
                      <a href="#" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-50">
                        <Image src={iconConfig} alt="icon configurações" className="mr-2.5" width={18} height={18} />
                        Configurações
                      </a>
                    </li>
                  </ul>
                </details>
              </div>
            </div>
          </div>
      </header>
    </div>
  );
}
