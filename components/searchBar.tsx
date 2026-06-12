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
}