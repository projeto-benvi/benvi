"use client";

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import EditarUsuarioComponent from "@/view/editarUsuario"; 

export default function RotaDinamicaPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const idDaUrl = Array.isArray(params.id) ? params.id[0] : params.id; 

  useEffect(() => {
    // 1. Aguarda o NextAuth terminar de checar a sessão
    if (status === "loading") return;

    // 2. Se o usuário não estiver logado, manda para o login
    if (status === "unauthenticated") {
      router.push('/login');
      return;
    }

    // 3. Se estiver logado, mas o ID da URL for diferente do ID dele na sessão (e ele não for admin)
    const idDoUsuarioLogado = session?.user && (session.user as any).id;

    if (idDoUsuarioLogado && String(idDaUrl) !== String(idDoUsuarioLogado)) {
      // Se você quiser permitir que administradores editem qualquer conta, descomente a linha abaixo:
      // if ((session.user as any).isAdmin) return;

      // Se não for o próprio dono da conta, redireciona para o próprio perfil dele ou página inicial
      router.push(`/editarUsuario/${idDoUsuarioLogado}`);
    }
  }, [status, session, idDaUrl, router]);

  // Enquanto valida a sessão ou se for um acesso inválido, exibe uma tela de carregamento
  if (status === "loading" || (session?.user && String(idDaUrl) !== String((session.user as any).id))) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 font-medium">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se passou em todas as validações, renderiza o componente de edição normalmente
  return <EditarUsuarioComponent idUsuario={idDaUrl} />;
}