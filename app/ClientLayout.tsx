'use client';

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/app/context/AuthContext";
import Sidebar from "@/components/Sidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const esconderSidebar =
    pathname.startsWith("/login") ||
    pathname.startsWith("/cadastro"); 
    
  return (
    <SessionProvider>
      <AuthProvider>
        {/* REMOVA classes como 'gap-x' ou 'p-...' aqui para não afastar os itens */}
        <div className="flex min-h-screen w-full bg-gray-50">
          
          {/* Sidebar fixada à esquerda - sem margens extras */}
          {!esconderSidebar && <Sidebar />}
          
          {/* Main: 'flex-1' faz ele preencher o restante. 
              Remova qualquer padding ou margem deste container pai se estiver afastando */}
          <main className="flex-1 w-full overflow-hidden flex flex-col">
            <div className="flex-1 w-full overflow-y-auto">
              {children}
            </div>
          </main>
          
        </div>
      </AuthProvider>
    </SessionProvider>
  );
}