"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar"; 

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Remove a barra lateral se a rota começar com /login, /cadastro ou /opc_cadastro
  const esconderSidebar = 
    pathname.startsWith("/login") || 
    pathname.startsWith("/cadastro") || 
    pathname.startsWith("/opc_cadastro");

  return (
    <div className="flex min-h-screen">
      {/* Só renderiza a Sidebar se não for uma rota de autenticação/cadastro */}
      {!esconderSidebar && <Sidebar />}

      {/* O 'flex-1' faz o conteúdo ocupar o restante da tela de forma fluida */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}