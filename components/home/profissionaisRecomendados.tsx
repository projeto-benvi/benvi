'use client';

import { useEffect, useState } from "react";
import Image from "next/image";


type Profissional = {
  id_usuario: number;
  nome: string;
  categoria_principal: string | null;
  media_nota: string | number;
  total_avaliacoes: number;
  foto_perfil: string | null;
}

export default function ProfissionaisRecomendados() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);

  useEffect(() => {
    async function buscarDestaques() {
      try {
        
        const res = await fetch("/api/prestador/destaques");
        if (res.ok) {
          const dados = await res.json();
          setProfissionais(dados);
        } else {
          console.error("Erro ao buscar profissionais de destaque.");
        }
      } catch (erro) {
        console.error("Erro na requisição dos profissionais:", erro);
      } finally {
        setCarregando(false);
      }
    }

    buscarDestaques();
  }, []);

  
  if (carregando) {
    return (
      <section className="w-full mt-10">
        <p className="text-center text-gray-500 animate-pulse">Carregando profissionais recomendados...</p>
      </section>
    );
  }

  return (
    <section className="w-full mt-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold text-gray-800">
          Profissionais Recomendados
        </h2>

        <button className="text-sm text-blue-600 hover:underline">
          Ver todos
        </button>
      </div>

      
      {profissionais.length === 0 ? (
        <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          Nenhum profissional bem avaliado encontrado no momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {profissionais.map((profissional) => (
            <div 
              key={profissional.id_usuario}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col items-center justify-between"
            >
              <div className="flex flex-col items-center w-full">
                <div className="mb-3 relative w-16 h-16">
                  <Image
                    // Caso o profissional não tenha foto no banco, usa um placeholder padrão genérico
                    src={profissional.foto_perfil || "/profissionais/default-avatar.png"}
                    alt={profissional.nome}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>

                <h3 className="font-semibold text-gray-800 text-center line-clamp-1 w-full">
                  {profissional.nome}
                </h3>

                <p className="text-sm text-gray-600 text-center line-clamp-1 mb-2">
                  {profissional.categoria_principal || "Prestador"}
                </p>

                <div className="flex items-center gap-1 text-sm mb-4">
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium">{profissional.media_nota}</span>
                  <span className="text-gray-400">({profissional.total_avaliacoes})</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium py-2 rounded-xl">
                Ver Perfil
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}