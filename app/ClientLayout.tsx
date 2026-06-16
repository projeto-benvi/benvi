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
        <div className="flex min-h-screen">
          {!esconderSidebar && <Sidebar />}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </AuthProvider>
    </SessionProvider>
  );
}