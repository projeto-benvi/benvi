'use client';

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CategoriaIcon } from "@/components/CategoriaIcon";

type Categoria = {
  id_categoria: number;
  nome_categoria: string;
  descricao: string | null;
};

export default function CategoriasPopulares() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  
  const carrosselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function buscarCategorias() {
      try {
        const res = await fetch("/api/categoria"); 
        if (res.ok) {
          const dados = await res.json();
          setCategorias(dados);
        }
      } catch (erro) {
        console.error("Erro ao buscar categorias:", erro);
      } finally {
        setCarregando(false);
      }
    }
    buscarCategorias();
  }, []);

  const rolarEsquerda = () => {
    if (carrosselRef.current) {
      carrosselRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const rolarDireita = () => {
    if (carrosselRef.current) {
      carrosselRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  if (carregando) {
    return <div className="w-full h-24 bg-gray-50 animate-pulse rounded-2xl mt-8"></div>;
  }

  return (
    <section className="w-full mt-8 relative group/secao">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Categorias</h2>
        <Link href="/categorias" className="text-xs text-blue-500 hover:underline">
          ver todos
        </Link>
      </div>

      <div className="relative w-full">
        {/* Botão Esquerdo */}
        <button 
          onClick={rolarEsquerda}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 p-2 rounded-full shadow-md hover:bg-gray-50 transition-all md:opacity-0 md:group-hover/secao:opacity-100 hidden sm:block"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Carrossel Ajustado */}
        <div 
          ref={carrosselRef}
          className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory pb-4 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categorias.map((cat) => (
            <Link
              key={cat.id_categoria}
              href={"/buscar-servicos?categoria=" + encodeURIComponent(cat.nome_categoria)}
              /* 
                 w-[140px] -> Define o tamanho fixo no mobile.
                 sm:w-[160px] -> Aumenta em tablets.
                 md:w-[calc(20%-16px)] -> Ocupa espaço fluido em telas maiores.
              */
              className="flex-none w-[140px] sm:w-[160px] md:w-[180px] lg:w-[calc(16.666%-16px)] snap-start flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group text-center h-28"
            >
              <div className="mb-2 transform group-hover:scale-110 transition-transform">
                <CategoriaIcon nome={cat.nome_categoria} />
              </div>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition-colors line-clamp-2 px-1">
                {cat.nome_categoria}
              </span>
            </Link>
          ))}
        </div>

        {/* Botão Direito */}
        <button 
          onClick={rolarDireita}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 p-2 rounded-full shadow-md hover:bg-gray-50 transition-all md:opacity-0 md:group-hover/secao:opacity-100 hidden sm:block"
          aria-label="Rolar para direita"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </section>
  );
}