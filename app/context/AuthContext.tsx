'use client';


import { createContext, useContext } from 'react';
import { useSession, signOut } from 'next-auth/react';

// ── Tipo do contexto ──────────────────────────────────────────────────────────
interface AuthContextType {
  user: {
    id: string;
    nome: string;
    email: string;
    avatar: string;
    isAdmin: boolean;
    nivelAcesso: number;
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

// ── Provider ──────────────────────────────────────────────────────────────────
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

// ── Hook ──────────────────────────────────────────────────────────────────────
// Mantém compatibilidade com o useAuth() que já existe no projeto
export function useAuth() {
  return useContext(AuthContext);
}