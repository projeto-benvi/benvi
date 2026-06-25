"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function EditarUsuarioPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // 1. Aguarda o NextAuth carregar as informações da sessão
    if (status === "loading") return;

    // 2. Se o usuário não estiver autenticado, redireciona para a tela de login
    if (status === "unauthenticated") {
      router.push('/login');
      return;
    }

    // 3. Se estiver logado, pega o ID da sessão e redireciona para a URL correta com o ID
    const idDoUsuarioLogado = session?.user && (session.user as any).id;
    
    if (idDoUsuarioLogado) {
      router.push(`/editarUsuario/${idDoUsuarioLogado}`);
    }
  }, [status, session, router]);

  // Exibe uma tela de carregamento amigável enquanto o NextAuth decide para onde enviar o usuário
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-gray-500 font-medium">Redirecionando para o seu perfil...</p>
      </div>
    </div>
  );
}