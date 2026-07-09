'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link"; 

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
          setProfissionais(Array.isArray(dados) ? dados.slice(0, 5) : []);
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
        <div className="w-full h-40 bg-gray-50 animate-pulse rounded-2xl"></div>
      </section>
    );
  }

  return (
    <section className="w-full mt-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800">
          Profissionais Recomendados
        </h2>
        <Link href="/buscar" className="text-xs text-blue-500 hover:underline">
          Ver todos
        </Link>
      </div>

      {profissionais.length === 0 ? (
        <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          Nenhum profissional bem avaliado encontrado no momento.
        </p>
      ) : (
        /* GRID RESPONSIVO:
           - grid-cols-1: 1 card por linha no mobile.
           - sm:grid-cols-2: 2 cards em telas pequenas.
           - lg:grid-cols-3: 3 cards em telas médias.
           - 2xl:grid-cols-5: até 5 em telas bem largas.
        */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {profissionais.map((profissional) => {
            const primeiraLetra = profissional.nome ? profissional.nome.charAt(0).toUpperCase() : "P";
            const notaFormatada = Number(profissional.media_nota || 0).toFixed(1);

            return (
              <div 
                key={profissional.id_usuario}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center w-full">
                  <div className="mb-3 w-16 h-16 rounded-full overflow-hidden bg-gray-200 shadow-sm flex items-center justify-center relative">
                    {profissional.foto_perfil ? (
                      <Image
                        src={profissional.foto_perfil}
                        alt={profissional.nome}
                        fill
                        className="rounded-full object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold uppercase">
                        {primeiraLetra}
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-800 text-center line-clamp-1 w-full text-sm">
                    {profissional.nome}
                  </h3>

                  <p className="text-xs text-gray-400 text-center line-clamp-1 mb-2 font-medium capitalize">
                    {profissional.categoria_principal || "Prestador"}
                  </p>

                  <div className="flex items-center gap-1 text-xs mb-4 font-semibold text-gray-700">
                    <span className="text-amber-400">★</span>
                    <span>{notaFormatada}</span>
                    <span className="text-gray-400 font-normal">({profissional.total_avaliacoes})</span>
                  </div>
                </div>

                <Link 
                  href={`/perfil/prestador/${profissional.id_usuario}`}
                  className="w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-sm font-medium py-2 rounded-xl text-center block"
                >
                  Ver Perfil
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}