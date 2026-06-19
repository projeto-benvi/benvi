"use client";

import Image from "next/image";
import { useRouter } from "next/navigation"; 
import { useSession } from "next-auth/react"; // Mudamos para o hook oficial do NextAuth

// Importações de assets
import iconSearch from "@/assets/icons/search.svg";
import iconFilter from "@/assets/icons/filter-alt-2.svg";
import iconNotification from "@/assets/icons/notification.svg";
import iconPerfil from "@/assets/comSearchBar/nft-profile.svg";
import iconConfig from "@/assets/comSearchBar/iconConfig.svg";

export default function SearchBar() {
  const { data: session, status } = useSession(); // Puxa os dados da sessão do NextAuth diretamente
  const router = useRouter();
    
 
  const usuarioLogado = session?.user as any;
  const nomeUsuario = usuarioLogado?.name || usuarioLogado?.nome || "Visitante";
  
  
  const subTitulo = usuarioLogado?.isAdmin 
    ? "Administrador 🛡️" 
    : usuarioLogado?.isPrestador 
      ? "Prestador 🛠️" 
      : "Cliente";

  const notificacoes: string[] = [];

  const lidarComRedirecionamentoPerfil = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!session || !usuarioLogado) {
      router.push("/login");
      return;
    }

    // Se o NextAuth marcou como prestador, redireciona para a rota dinâmica corretiva
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
            className="flex-1 h-full text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
          
          <button 
            type="button" 
            className="px-3 border-l border-gray-200 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <Image src={iconFilter} alt="Filtro" width={18} height={18} />
          </button>
        </div>

        {/* Lado Direito: Notificações + Info Usuário */}
        <div className="flex items-center gap-4">
          
          {/* Menu Dropdown de Notificações */}
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

          {/* Textos Informativos */}
          <div className="flex flex-col text-right select-none">
            <span className="text-sm font-semibold text-gray-800 leading-tight">
              Olá, <span className="font-bold">{nomeUsuario}</span>
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {subTitulo}
            </span>
          </div>

          {/* FOTO DE PERFIL DINÂMICA */}
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
                  <button 
                    onClick={lidarComRedirecionamentoPerfil}
                    className="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Image src={iconPerfil} alt="icon perfil" className="mr-2.5" width={18} height={18} />
                    Meu perfil
                  </button>
                </li>
                <li>
                  <a href="/tela-configuracoes" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-50">
                    <Image src={iconConfig} alt="icon configurações" className="mr-2.5" width={18} height={18} />
                    Configurações
                  </a>
                </li>
              </ul>
            </details>
          </div>

        </div>
      </header>
    </div>
  );
}