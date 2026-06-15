"use client";

import Image from "next/image";

// Importações de assets
import iconSearch from "@/assets/icons/search.svg";
import iconFilter from "@/assets/icons/filter-alt-2.svg";
import iconNotification from "@/assets/icons/notification.svg";
import iconPerfil from "@/assets/comSearchBar/nft-profile.svg";
import iconConfig from "@/assets/comSearchBar/iconConfig.svg";
import userPlaceholder from "@/assets/user.png";

// Hook de autenticação
import { useAuth } from '@/hooks/useAuth';

// Adicionamos esta interface para silenciar o erro de "Property does not exist"
interface UserCustom {
    nome?: string;
    avatar?: string;
}

export default function SearchBar() {
<<<<<<< HEAD
    // Usamos o 'as' para dizer ao TypeScript: "confie em mim, este objeto tem esses campos"
    const { user: currentUser } = useAuth() as { user: UserCustom | null };
    
    const nomeUsuario = currentUser?.nome || "Usuário";
    const avatarUsuario = currentUser?.avatar || userPlaceholder.src;

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
                    <Image className="ml-2" src={iconFilter} alt="Filtro" width={20} height={20} />
                </div>

                {/* Perfil e Ações */}
                <div className="flex items-center gap-4">
                    <Image
                        src={iconNotification}
                        alt="Notificações"
                        width={24}
                        height={24}
                        className="cursor-pointer"
                    />
                    
                    <div className="text-right">
                        <p className="font-semibold text-gray-800 text-sm">Olá, {nomeUsuario}</p>
                        <p className="text-xs text-gray-500 hover:text-blue-600 cursor-pointer">Cliente</p>
                    </div>

                    {/* Imagem do usuário */}
                    <Image
                        className="rounded-full object-cover border border-gray-200"
                        src={avatarUsuario}
                        alt="Foto usuário"
                        width={40}
                        height={40}
                    />

                    {/* Menu Dropdown */}
                    <details className="relative">
                        <summary className="cursor-pointer list-none text-xl px-2 rotate-90 hover:text-blue-600">
                            &#x27A4;    
                        </summary>
                        <ul className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                            <li>
                                <a href="#" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                                    <Image src={iconPerfil} alt="Perfil" className="mr-2" width={20} height={20} />
                                    Meu perfil
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                                    <Image src={iconConfig} alt="Config" className="mr-2" width={20} height={20} />
                                    Configurações
                                </a>
                            </li>
                        </ul>
                    </details>
                </div>
            </header>
        </div>
    );

  // Simulando uma lista de notificações vinda do banco ou estado (vazia para testar a sua frase)
 const notificacoes: string[] = [];

  return (
    <div className="w-full bg-white">
      <form 
        action="" 
        className="border-b-2 border-gray-100 h-20 flex items-center justify-between px-10"
      >
        {/* 1. Barra de Busca Centralizada com Filtro */}
        <div className="flex items-center border border-gray-200 rounded-xl h-11 shadow-sm w-full max-w-[440px] bg-white group focus-within:border-blue-500 transition-all">
          <div className="pl-3 pr-2 flex items-center justify-center text-gray-400">
            <Image src={iconSearch} alt="icon Search" width={18} height={18} />
          </div>
          
          <input 
            type="text" 
            placeholder="Buscar serviços..."
            className="flex-1 h-full text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
          
          <button 
            type="button" 
            className="px-3 border-l border-gray-200 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <Image src={iconFilter} alt="icon Filter" width={18} height={18} />
          </button>
        </div>

        {/* 2. Bloco do Usuário e Notificações (Lado Direito) */}
        <div className="flex items-center gap-4">
          
          {/* MENU DROPDOWN DE NOTIFICAÇÕES */}
          <div className="relative flex items-center">
            <details className="relative inline-block text-left group">
              <summary className="flex items-center cursor-pointer list-none p-2 hover:bg-gray-50 rounded-full transition-colors relative">
                <Image
                  src={iconNotification}
                  alt="icon notificação"
                  width={22}
                  height={22}
                />
                {/* Bolinha vermelha indicadora (só aparece se houver notificações) */}
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
                  /* Estado Vazio solicitado */
                  <div className="py-6 flex flex-col items-center justify-center text-center">
                    <span className="text-xl mb-1"></span>
                    <p className="text-sm font-medium text-gray-500">
                      Nada para ver por aqui...
                    </p>
                  </div>
                ) : (
                  /* Se houvesse notificações, elas seriam mapeadas aqui */
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

          {/* Info Textual do Usuário */}
          <div className="flex flex-col text-right select-none">
            <span className="text-sm font-semibold text-gray-800 leading-tight">
              Olá, <span className="font-bold">Pedro</span>
            </span>
            <span className="text-xs text-gray-400 font-medium">
              Cliente
            </span>
          </div>

          {/* Foto de Perfil Redonda */}
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 relative">
            <Image
              src={user}
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
                  <a href="#" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Image src={iconPerfil} alt="icon perfil" className="mr-2.5" width={18} height={18} />
                    Meu perfil
                  </a>
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
      </form>
    </div>
  )
}