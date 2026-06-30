'use client';

import { createContext } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface AuthContextType {
  user: {
    id: string;
    nome: string;
    email: string;
    avatar: string;
    isAdmin: boolean;
    nivelAcesso: number;
    isPrestador: boolean;
    telefone?: string;
    cidade?: string;
  } | null;
  logado: boolean;
  carregando: boolean;
  logout: () => void;
  atualizarSessao: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  logado: false,
  carregando: true,
  logout: () => {},
  atualizarSessao: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();

  const carregando = status === 'loading';
  const logado = status === 'authenticated';

  const user = session?.user
    ? {
        id: (session.user as any).id ?? '',
        nome: session.user.name ?? '',
        email: session.user.email ?? '',
        avatar: session.user.image ?? '',
        isAdmin: (session.user as any).isAdmin ?? false,
        nivelAcesso: (session.user as any).nivelAcesso ?? 1,
        isPrestador: (session.user as any).isPrestador ?? false,
        telefone: (session.user as any).telefone ?? "",
        cidade: (session.user as any).cidade ?? "",
      }
    : null;

  function logout() {
    signOut({ callbackUrl: '/login' });
  }

  async function atualizarSessao() {
    await update();
  }

  return (
    <AuthContext.Provider value={{ user, logado, carregando, logout, atualizarSessao }}>
      {children}
    </AuthContext.Provider>
  );
}