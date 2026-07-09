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
  
  // Referência para controlar a rolagem da div do carrossel
  const carrosselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function buscarCategorias() {
      try {
        // Alvo da API padrão do seu projeto para listagem de categorias
        const res = await fetch("/api/categoria"); 
        if (res.ok) {
          const dados = await res.json();
          // Modificado: Removido o slice para trazer todas as categorias cadastradas para o carrossel
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

  // Funções manuais para rolar as categorias para os lados através dos botões
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
    // group/secao adicionado aqui para controlar a visibilidade das setas ao passar o mouse
    <section className="w-full mt-8 relative group/secao">
      {/* Cabeçalho da seção conforme o protótipo */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Categorias
        </h2>
        <Link href="/categorias" className="text-xs text-blue-500 hover:underline">
          ver todos
        </Link>
      </div>

      {/* Container posicionado para alinhar as setas nas extremidades */}
      <div className="relative w-full">
        
        {/* Botão para passar para a esquerda (visível do sm em diante ao dar hover na seção) */}
        <button 
          onClick={rolarEsquerda}
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 p-2 rounded-full shadow-md hover:bg-gray-50 transition-all md:opacity-0 md:group-hover/secao:opacity-100 hidden sm:block"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Linha do Carrossel (Substituiu o Grid estático para permitir rolagem fluida e snap) */}
        <div 
          ref={carrosselRef}
          className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categorias.map((cat) => (
            <Link
              key={cat.id_categoria}
              href={"/buscar?categoria=" + encodeURIComponent(cat.nome_categoria)}
              // Larguras calculadas por break-point para manter a proporção exata do grid anterior
              className="flex-none w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(16.666%-14px)] snap-start flex flex-col items-center justify-center p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group text-center h-28"
            >
              {/* Espaço do Ícone */}
              <div className="mb-3 transform group-hover:scale-110 transition-transform">
                <CategoriaIcon nome={cat.nome_categoria} />
              </div>

              {/* Nome da Categoria */}
              <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition-colors line-clamp-2 px-1">
                {cat.nome_categoria}
              </span>
            </Link>
          ))}
        </div>

        {/* Botão para passar para a direita (visível do sm em diante ao dar hover na seção) */}
        <button 
          onClick={rolarDireita}
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 p-2 rounded-full shadow-md hover:bg-gray-50 transition-all md:opacity-0 md:group-hover/secao:opacity-100 hidden sm:block"
          aria-label="Rolar para direita"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </section>
  );
}
