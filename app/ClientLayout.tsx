'use client';

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/app/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/searchBar"; 

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const esconderSidebar = pathname.startsWith("/login") || pathname.startsWith("/cadastro");

  return (
    <SessionProvider>
      <AuthProvider>
        <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
          {!esconderSidebar && <Sidebar />}
          
          <main className="flex-1 w-full flex flex-col overflow-hidden">
            {/* Cabeçalho Fixo */}
            {!esconderSidebar && (
              <header className="w-full h-20 flex-shrink-0">
                <SearchBar />
              </header>
            )}

            {/* Conteúdo rolável */}
            <div className="flex-1 w-full overflow-y-auto">
              {children}
            </div>
          </main>
        </div>
      </AuthProvider>
    </SessionProvider>
  );
}