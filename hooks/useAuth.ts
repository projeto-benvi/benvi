import { useState, useEffect } from "react";

export interface UsuarioAuth {
  id_usuario?: number;
  nome: string;
  email: string;
  foto_perfil?: string;
  nivel_acesso?: number;
  cidade?: string;
}

export function useAuth() {
  const [user, setUser] = useState<UsuarioAuth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega o usuário do localStorage caso exista
    const savedUser = localStorage.getItem("benvi_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Erro ao parsear usuário logado:", e);
      }
      setLoading(false);
    } else {
      // Simulação de carregamento e fallback com um usuário de teste no ambiente de desenvolvimento
      const timer = setTimeout(() => {
        setUser({
          nome: "Pedro Silva",
          email: "pedro.silva@exemplo.com",
          nivel_acesso: 1, // 1 - Cliente, 2 - Prestador, etc.
          cidade: "São Paulo",
        });
        setLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const login = (userData: UsuarioAuth) => {
    localStorage.setItem("benvi_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("benvi_user");
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
