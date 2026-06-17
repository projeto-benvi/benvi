'use client';

import { useEffect, useState } from "react";
import { 
  Hammer,     // Pedreiro
  Zap,        // Eletricista
  Droplet,    // Encanador
  Trees,      // Carpinteiro / Madeira
  Paintbrush, // Pintor
  Layers,     // Gesseiro / Divisórias
  Construction, // Serralheiro / Metalúrgica
  Wrench      // Ícone padrão caso surja outra
} from "lucide-react";


type Categoria = {
  id_categoria: number;
  nome_categoria: string;
  descricao: string | null;
};

// Função auxiliar para renderizar o ícone correto baseado no nome da categoria
const obterIconeCategoria = (nome: string) => {
  switch (nome.toLowerCase()) {
    case 'pedreiro': return <Hammer className="w-7 h-7 text-green-600" />;
    case 'eletricista': return <Zap className="w-7 h-7 text-blue-600" />;
    case 'encanador': return <Droplet className="w-7 h-7 text-cyan-600" />;
    case 'carpinteiro': return <Trees className="w-7 h-7 text-amber-700" />;
    case 'pintor': return <Paintbrush className="w-7 h-7 text-purple-600" />;
    case 'gesseiro': return <Layers className="w-7 h-7 text-orange-500" />;
    case 'serralheiro': return <Construction className="w-7 h-7 text-gray-600" />;
    default: return <Wrench className="w-7 h-7 text-blue-600" />;
  }
};

export default function CategoriasPopulares() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);

  useEffect(() => {
    async function buscarCategorias() {
      try {
        // Alvo da API padrão do seu projeto para listagem de categorias
        const res = await fetch("/api/categoria"); 
        if (res.ok) {
          const dados = await res.json();
          // Pega apenas as primeiras 6 para manter o grid alinhado com o protótipo
          setCategorias(dados.slice(0, 6));
        }
      } catch (erro) {
        console.error("Erro ao buscar categorias:", erro);
      } finally {
        setCarregando(false);
      }
    }

    buscarCategorias();
  }, []);

  if (carregando) {
    return <div className="w-full h-24 bg-gray-50 animate-pulse rounded-2xl mt-8"></div>;
  }

  return (
    <section className="w-full mt-8">
      {/* Cabeçalho da seção conforme o protótipo */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Categorias populares
        </h2>
        <button className="text-xs text-blue-500 hover:underline">
          ver todos
        </button>
      </div>

      {/* Grid de Cards responsivo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categorias.map((cat) => (
          <button
            key={cat.id_categoria}
            className="flex flex-col items-center justify-center p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all group text-center h-28"
          >
            {/* Espaço do Ícone */}
            <div className="mb-3 transform group-hover:scale-110 transition-transform">
              {obterIconeCategoria(cat.nome_categoria)}
            </div>

            {/* Nome da Categoria */}
            <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition-colors line-clamp-2 px-1">
              {cat.nome_categoria}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}