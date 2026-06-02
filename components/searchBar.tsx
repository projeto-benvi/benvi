"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

// Importações com caminhos relativos ou alias configurados no tsconfig
import iconSearch from "@/assets/icons/search.svg";
import iconFilter from "@/assets/icons/filter-alt-2.svg";
import userFallback from "@/assets/user.png";
import iconNotification from "@/assets/icons/notification.svg";
import iconPerfil from "@/assets/comSearchBar/nft-profile.svg";
import iconConfig from "@/assets/comSearchBar/iconConfig.svg";

export default function SearchBar() {
  const { user, loading, logout } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <header className="sticky top-0 right-0 left-0 z-30 flex items-center justify-between h-20 px-4 md:px-8 bg-white border-b-2 border-gray-100 shadow-sm w-full">
      {/* Barra de busca responsiva */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex items-center flex-1 max-w-md md:max-w-lg bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all gap-2"
      >
        <Image
          src={iconSearch}
          alt="Ícone de busca"
          width={20}
          height={20}
          className="opacity-50"
        />
        <input
          type="text"
          placeholder="Buscar por serviços ou profissionais..."
          className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-700 placeholder-gray-400 focus:ring-0"
        />
        <button
          type="button"
          className="p-1 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer border-l border-gray-200 pl-2"
          title="Filtros de busca"
        >
          <Image
            src={iconFilter}
            alt="Ícone de filtro"
            width={20}
            height={20}
            className="opacity-60 hover:opacity-100 transition-opacity"
          />
        </button>
      </form>

      {/* Notificações, Perfil e Autenticação */}
      <div className="flex items-center gap-4 ml-4">
        {/* Ícone de Notificações */}
        <button
          type="button"
          className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
          title="Notificações"
        >
          <Image
            src={iconNotification}
            alt="Notificações"
            width={20}
            height={20}
          />
          {/* Badge indicador de nova notificação */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Divisor Vertical */}
        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        {/* Renderização condicional do estado de autenticação */}
        {loading ? (
          /* Estado de Carregamento (Skeleton) */
          <div className="animate-pulse flex items-center gap-3">
            <div className="text-right hidden md:block space-y-1">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-3 w-12 bg-gray-200 rounded ml-auto"></div>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          </div>
        ) : user ? (
          /* Usuário Autenticado */
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-800 line-clamp-1 max-w-[150px]">
                {user.nome}
              </p>
              <p className="text-xs text-gray-500 font-medium">
                {user.nivel_acesso === 2 ? "Prestador" : "Cliente"}
              </p>
            </div>

            {/* Dropdown de Perfil usando details e summary */}
            <details className="relative list-none group">
              <summary className="flex items-center gap-1.5 cursor-pointer list-none focus:outline-none select-none">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm hover:border-blue-500 transition-all flex items-center justify-center bg-gray-50">
                  <Image
                    src={user.foto_perfil || userFallback}
                    alt="Foto do usuário"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
                <span className="text-gray-400 text-[10px] hidden sm:inline-block transition-transform duration-200 group-open:rotate-180">
                  ▼
                </span>
              </summary>

              {/* Menu suspenso */}
              <ul className="absolute right-0 mt-2.5 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden">
                <li>
                  <Link
                    href="/perfil"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Image
                      src={iconPerfil}
                      alt="Ícone perfil"
                      width={20}
                      height={20}
                    />
                    Meu Perfil
                  </Link>
                </li>
                <li>
                  <Link
                    href="/configuracoes"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Image
                      src={iconConfig}
                      alt="Ícone configurações"
                      width={20}
                      height={20}
                    />
                    Configurações
                  </Link>
                </li>
                <hr className="border-gray-100 my-1" />
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer text-left"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-red-500"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sair
                  </button>
                </li>
              </ul>
            </details>
          </div>
        ) : (
          /* Usuário não logado (Fallback) */
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-xl hover:bg-gray-100"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="text-sm font-semibold bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/10"
            >
              Cadastrar
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}