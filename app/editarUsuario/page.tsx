"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditarUsuarioPage() {
  const router = useRouter();

  useEffect(() => {
    
    console.log("Rota geral acessada. Redirecionando para um ID válido se necessário.");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md text-center space-y-4">
        <span className="text-4xl">🔍</span>
        <h1 className="text-xl font-bold text-gray-900">Nenhum usuário selecionado</h1>
        <p className="text-sm text-gray-500">
          Para editar um perfil, você precisa informar o ID diretamente na URL.
        </p>
        <div className="bg-blue-50 text-blue-700 text-xs font-mono p-3 rounded-xl border border-blue-100">
          Exemplo: localhost:3000/editarUsuario/1
        </div>
      </div>
    </div>
  );
}