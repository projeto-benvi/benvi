"use client";

import { ChevronLeft, Star } from "lucide-react";
import Image from "next/image";
import SearchBar from "@/components/searchBar";
import userAvatar from "@/assets/user.png";

// ─── Dados mockados

const servicosContratados = [
  {
    id: 1,
    titulo: "Instalação de torneira",
    profissional: "Carlos Silva - Encanador",
    data: "12/05/2026",
    status: "Concluido",
    imagemUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=80&h=80&fit=crop",
  },
  {
    id: 2,
    titulo: "Instalação de luminária",
    profissional: "João Pereira - Eletricista",
    data: "28/04/2026",
    status: "Concluido",
    imagemUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=80&h=80&fit=crop",
  },
  {
    id: 3,
    titulo: "Troca de tomadas",
    profissional: "Carlos Silva - Eletricista",
    data: "15/03/2024",
    status: "Avaliar",
    imagemUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop",
  },
];

const avaliacoesRecentes = [
  {
    id: 1,
    nome: "Carlos Silva",
    profissao: "Encanador",
    nota: 5.0,
    data: "12/05/2026",
    texto: "Excelente profissional! Resolveu o problema rapidamente e foi muito atencioso.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&face",
  },
  {
    id: 2,
    nome: "João Pereira",
    profissao: "Eletricista",
    nota: 4.5,
    data: "28/04/2026",
    texto: "Muito bom atendimento e serviço de qualidade. Recomendo!",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&face",
  },
  {
    id: 3,
    nome: "Ana Costa",
    profissao: "Diarista",
    nota: 5.0,
    data: "28/04/2026",
    texto: "Deixou tudo impecável! Super cuidadosa e caprichosa.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&face",
  },
];



function StarRating({ nota }: { nota: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = nota >= i;
        const half = !filled && nota >= i - 0.5;
        return (
          <span key={i} className="relative w-3.5 h-3.5 inline-block">
            {/* Estrela de fundo (vazia) */}
            <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-100 absolute inset-0" />
            {/* Estrela preenchida */}
            {(filled || half) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: half ? "50%" : "100%" }}
              >
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}


export default function PerfilUsuario() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col w-full">
      <SearchBar />

      <div className="px-6 py-6 flex flex-col gap-5 w-full max-w-[1200px] mx-auto">

        
        <button className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700 w-fit transition-colors">
          <ChevronLeft size={16} />
          Voltar
        </button>

        <h1 className="text-2xl font-bold text-gray-800 -mt-1">Perfil</h1>

      
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible relative">

          
          <div
            className="w-full h-32 rounded-t-2xl flex justify-end items-start p-5"
            style={{
              background: "linear-gradient(135deg, #93C5FD 0%, #6EE7B7 100%)",
            }}
          >
            <button className="bg-white text-blue-600 font-bold text-sm px-5 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-all">
              Editar perfil
            </button>
          </div>

        
          <div className="px-8 pb-6 pt-14 grid grid-cols-3 items-center relative">

            
            <div className="absolute left-8 -top-14 flex flex-col items-center gap-2">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-white relative">
                <Image src={userAvatar} alt="Foto de perfil" fill className="object-cover" />
              </div>
              <span className="bg-[#BBF7D0] text-emerald-800 font-bold text-[11px] px-5 py-1 rounded-full shadow-sm">
                Cliente
              </span>
            </div>

            
            <div />

            
            <div className="flex flex-col items-center justify-center border-r border-gray-100 py-2">
              <div className="flex items-center gap-1.5">
                <Star className="text-amber-400 fill-amber-400 w-6 h-6" />
                <span className="text-xl font-bold text-gray-800">4,8</span>
              </div>
              <span className="text-xs text-gray-400 font-semibold mt-1">Média de avaliações</span>
            </div>

            {/* Serviços contratados */}
            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-xl font-bold text-gray-800">10</span>
              <span className="text-xs text-gray-400 font-semibold mt-1">Serviços contratados</span>
            </div>
          </div>
        </div>

        {/* ── Grade inferior ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {/* Coluna esquerda (2/3) */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Sobre */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Sobre</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Gosto de praticidade e bom atendimento. Sempre busco profissionais confiáveis e bem avaliados.
              </p>
            </div>

            {/* Serviços contratados */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">Serviços contratados</h3>
                <button className="text-xs font-bold text-blue-500 hover:underline">
                  Ver todos
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {servicosContratados.map((servico) => (
                  <div
                    key={servico.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Foto do serviço */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0 bg-gray-100">
                        <img
                          src={servico.imagemUrl}
                          alt={servico.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">{servico.titulo}</span>
                        <span className="text-xs font-medium text-gray-400 mt-0.5">
                          {servico.profissional}
                        </span>
                        <span className="text-[11px] text-gray-400 mt-0.5">{servico.data}</span>
                      </div>
                    </div>

                    {/* Status */}
                    {servico.status === "Concluido" ? (
                      <span className="bg-[#BBF7D0] text-emerald-800 font-bold text-xs px-4 py-1.5 rounded-xl whitespace-nowrap">
                        Concluído
                      </span>
                    ) : (
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-1.5 rounded-xl shadow-sm transition-all whitespace-nowrap">
                        Avaliar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna direita (1/3) — Avaliações recentes */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-5">Avaliações recentes</h3>

            <div className="flex flex-col gap-5">
              {avaliacoesRecentes.map((aval) => (
                <div
                  key={aval.id}
                  className="flex flex-col border-b border-gray-100 last:border-0 pb-5 last:pb-0"
                >
                  {/* Cabeçalho da avaliação */}
                  <div className="flex items-center gap-3">
                    {/* Avatar do profissional */}
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 relative">
                      <img
                        src={aval.avatarUrl}
                        alt={aval.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Nome, profissão e nota */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-bold text-gray-800 leading-tight truncate">
                          {aval.nome}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <StarRating nota={aval.nota} />
                          <span className="text-xs font-bold text-gray-700">
                            {aval.nota.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-gray-400">{aval.profissao}</span>
                        <span className="text-[10px] text-gray-400">{aval.data}</span>
                      </div>
                    </div>
                  </div>

                  {/* Texto da avaliação */}
                  <p className="text-xs text-gray-500 italic mt-3 leading-relaxed">
                    "{aval.texto}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}