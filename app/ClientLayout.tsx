"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/searchBar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // colocar aqui rotas que nao devem ter a sidebar
  const rotasSemSidebar = ["/login", "/opc_cadastro", "/cadastro-prestador"];
  
  const esconderSidebar = rotasSemSidebar.includes(pathname);

  return (
    <div className="flex min-h-screen">
      {/*Só renderiza a Sidebar se não for uma rota de exclusão */}
      {!esconderSidebar && <Sidebar />}

      {/* O container flex flex-col organiza a SearchBar no topo e o main abaixo */}
      <div className="flex-1 flex flex-col min-h-screen">
        {!esconderSidebar && <SearchBar />}
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}