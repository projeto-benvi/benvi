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
  } | null;
  logado: boolean;
  carregando: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  logado: false,
  carregando: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

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
      }
    : null;

  function logout() {
    signOut({ callbackUrl: '/login' });
  }

  return (
    <AuthContext.Provider value={{ user, logado, carregando, logout }}>
      {children}
    </AuthContext.Provider>
  );
}