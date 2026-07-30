"use client";

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
        <div className="flex min-h-[100dvh] w-full min-w-0 overflow-x-hidden">
          {!esconderSidebar && <Sidebar />}
          <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
            {children}
          </main>
        </div>
      </AuthProvider>
    </SessionProvider>
  );
}
