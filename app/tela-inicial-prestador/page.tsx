"use client";

import React from 'react';
import SearchBar from '@/components/searchBar';
import { Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function TelaInicialPrestador() {
  const { user } = useAuth();
  const nomeExibicao = user?.nome || "Usuário";

  // Dados da agenda...
  const agendaHoje = [
    { horario: "09:00", servico: "Manutenção de vazamento", endereco: "Rua Augusta, 450 - Consolação", status: "Concluído", corStatus: "bg-green-500", bgBadge: "bg-green-100 text-green-700" },
    // ... restante dos dados igual
  ];

  return (
    <div className="w-full min-h-screen p-8 bg-slate-50 text-slate-800 flex flex-col overflow-y-auto">
      
      {/* O SearchBar agora é independente e busca o user no hook */}
      <header className="mb-6 w-full">
        <div className="flex items-center justify-between w-full">
          <SearchBar />
        </div>
      </header>

      {/* BANNER DINÂMICO */}
      <div className="bg-white rounded-xl p-6 mb-8 border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Olá, {nomeExibicao}</h1>
        <p className="text-gray-500 text-sm mt-1">Aqui está um resumo de suas atividades</p>
      </div>

      {/* ... restante do seu grid de cards e agenda igual ... */}
    </div>
  );
}