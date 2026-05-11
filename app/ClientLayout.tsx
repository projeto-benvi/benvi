"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

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

      {/*O 'flex-1' faz o conteúdo ocupar o restante da tela */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}