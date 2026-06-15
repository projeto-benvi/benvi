import Form from "next/form"
import Image from "next/image"
import Link from "next/link" // Importação adicionada para navegação interna

import iconSearch from "@/assets/icons/search.svg"
import iconFilter from "@/assets/icons/filter-alt-2.svg"
import user from "@/assets/user.png"
import iconNotification from "@/assets/icons/notification.svg"
import iconPerfil from "@/assets/comSearchBar/nft-profile.svg"
import iconConfig from "@/assets/comSearchBar/iconConfig.svg"

export default function SearchBar() {
  
  const notificacoes: string[] = [];

  return (
    <div className="w-full bg-white">
      <form 
        action="" 
        className="border-b-2 border-gray-100 h-20 flex items-center justify-between px-10"
      >
        
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

       
        <div className="flex items-center gap-4">
          
        
          <div className="relative flex items-center"> 
            <details className="relative inline-block text-left group">
              <summary className="flex items-center cursor-pointer list-none p-2 hover:bg-gray-50 rounded-full transition-colors relative">
                <Image
                  src={iconNotification}
                  alt="icon notificação"
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

          {/* Info Textual do Usuário */}
          <div className="flex flex-col text-right select-none">
            <span className="text-sm font-semibold text-gray-800 leading-tight">
              Olá, <span className="font-bold">Pedro</span>
            </span>
            <span className="text-xs text-gray-400 font-medium">
              Cliente
            </span>
          </div>

          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 relative">
            <Image
              src={user}
              alt="Foto usuario"
              fill
              className="object-cover"
            />
          </div>

         
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
      </form>
    </div>
  )
}