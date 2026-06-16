"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/components/searchBar";


// 1. Definição estrita das Interfaces
interface AgendaItem {
  id: string;
  hora: string;
  evento: string;
  local: string;
  status: "Concluido" | "Confirmado" | "Pendente" | "Cancelado";
}
interface ItemServico {
  id_servico: number;
  titulo: string;
  nome_usuario?: string; // Nome do cliente que solicitou ou gerou o vínculo
  data_inicio: string | Date;
  status_servico: string;
}


interface InicialPrestadorProps {
  agendaHoje: AgendaItem[];
}

export default function InicialPrestador({ agendaHoje }: InicialPrestadorProps) {
  // Mapeamento visual das cores baseado no status
  const statusColors = {
    Concluido: "bg-[#4ADE80]",
    Confirmado: "bg-[#2563EB]",
    Pendente: "bg-[#F97316]",
    Cancelado: "bg-red-500",
  };
  const [servicosDoBanco, setServicosDoBanco] = useState<ItemServico[]>([]);

  // Seus dados estáticos de Serviços Recentes para manter o layout da esquerda
  const servicosRecentes = [
    {
      titulo: "Instalação de torneira",
      cliente: "Maria Aparecida",
      data: "12/05/2026",
      status: "Pendente",
      statusBg: "bg-[#FDF4E9] text-[#F97316]"
    },
    {
      titulo: "Cano estourado",
      cliente: "João Pereira",
      data: "28/04/2026",
      status: "Concluido",
      statusBg: "bg-[#ECFDF5] text-[#10B981]"
    },
    {
      titulo: "Troca de tomadas",
      cliente: "Lucas Borges",
      data: "15/03/2024",
      status: "",
      statusBg: ""
    }
  ];
  useEffect(() => {
    async function carregarServicos() {
      try {
        const response = await fetch('/api/servico'); // Certifique-se de que sua rota de API usa o servicoController
        const dados = await response.json();
        setServicosDoBanco(dados);
      } catch (error) {
        console.error("Erro ao carregar serviços recentes do banco:", error);
      }
    }

    carregarServicos();
  }, []);
  return (
    <div className="flex bg-[#F8FAFC] min-h-screen antialiased text-gray-800 w-full">
      <div className="flex-1 flex flex-col min-w-0">
        
        <SearchBar />

        <main className="flex-1 p-8 flex gap-8 overflow-y-auto">
          
          {/* Coluna da Esquerda */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Olá, Carlos</h1>
              <p className="text-sm text-gray-500 mt-1">Aqui está um resumo de suas atividades</p>
            </div>

            {/* Grid dos 3 Cards Superiores */}
            <div className="grid grid-cols-3 gap-5">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition">
                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100 text-2xl">
                  📅
                </div>
                <span className="text-xs font-bold text-gray-500">Agendamentos hoje</span>
                <button type="button" className="cursor-pointer text-xs text-blue-600 font-bold mt-2 inline-flex items-center gap-1 hover:underline">
                  Ver agenda ➔
                </button>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition">
                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100 text-2xl">
                  ⭐
                </div>
                <span className="text-xs font-bold text-gray-500">Avaliação média</span>
                <button type="button" className="cursor-pointer text-xs text-blue-600 font-bold mt-2 inline-flex items-center gap-1 hover:underline">
                  Ver avaliações ➔
                </button>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition">
                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100 text-2xl">
                  📋
                </div>
                <span className="text-xs font-bold text-gray-500">Serviços concluídos</span>
                <button type="button" className="cursor-pointer text-xs text-blue-600 font-bold mt-2 inline-flex items-center gap-1 hover:underline">
                  Ver todos ➔
                </button>
              </div>
            </div>

            {/* Container de Serviços Recentes */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 flex-1 flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-900">Serviços recentes</h2>
                <button type="button" className="cursor-pointer text-xs text-blue-600 font-bold hover:underline">Ver todos</button>
              </div>
              
              <div className="flex flex-col gap-3">
                {servicosDoBanco.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center py-4">Nenhum serviço recente.</div>
                ) : (
                    servicosDoBanco.map((servico) => (
                    <div key={servico.id_servico} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-gray-200 rounded-lg shrink-0 flex items-center justify-center text-xs text-gray-400 font-semibold">
                            Foto
                        </div>
                        <div className="flex flex-col">
                            {/* Dados vindos de servicoService.ts */}
                            <h4 className="text-xs font-bold text-gray-900">{servico.titulo}</h4>
                            <p className="text-[11px] text-gray-500 mt-0.5">{servico.nome_usuario || "Cliente"}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(servico.data_inicio).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        </div>

                        <span className={`text-[10px] font-bold px-3 py-1 rounded-md shadow-xs 
                        ${servico.status_servico === 'concluido' ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#FDF4E9] text-[#F97316]'}`}>
                        {servico.status_servico}
                        </span>
                    </div>
                    ))
                )}
                </div>
            </div>
          </div>

          {/* Coluna da Direita: Agenda de Hoje Integrada com Banco */}
          <div className="w-[360px] bg-white border border-gray-100 rounded-2xl p-6 flex flex-col shadow-sm shrink-0 h-[520px]">
            <h2 className="text-base font-bold text-gray-900 mb-6">Agenda de hoje</h2>

            {agendaHoje.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                Nenhum compromisso para hoje.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 relative flex flex-col gap-6 pl-4 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {agendaHoje.map((item) => (
                  <div key={item.id} className="flex gap-4 relative items-start">
                    
                    <span className={`w-2.5 h-2.5 rounded-full ${statusColors[item.status] || "bg-gray-300"} mt-1.5 z-10 ring-4 ring-white shrink-0`} />
                    
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 shrink-0">{item.hora}</span>
                        <h3 className="text-xs font-bold text-gray-800 truncate">{item.evento}</h3>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">{item.local}</p>
                      
                      <div className="mt-1">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md text-white shadow-xs
                          ${item.status === 'Concluido' ? 'bg-[#4ADE80]' : ''}
                          ${item.status === 'Confirmado' ? 'bg-[#2563EB]' : ''}
                          ${item.status === 'Pendente' ? 'bg-[#F97316]' : ''}
                          ${item.status === 'Cancelado' ? 'bg-red-500' : ''}
                        `}>
                          {item.status}
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

            <button type="button" className="cursor-pointer w-full text-center text-xs text-blue-600 font-bold border-t border-gray-100 pt-4 mt-4 hover:underline inline-flex justify-center items-center gap-1 shrink-0">
              Ver agenda completa ➔
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}