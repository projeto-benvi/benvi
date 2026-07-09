"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, UsersRound } from "lucide-react";
import SearchBar from "@/components/searchBar";
import { CategoriaIcon } from "@/components/CategoriaIcon";

interface Categoria {
  id_categoria?: number;
  nome_categoria: string;
  descricao?: string;
  total_prestadores?: number;
}

const gruposFiltros = [
  { nome: "Todos", palavrasChave: [] },
  { nome: "Serviços domésticos", palavrasChave: ["diarista", "faxineira", "babá", "cuidador", "costureira", "lavador", "jardineiro"] },
  { nome: "Manutenção", palavrasChave: ["eletricista", "encanador", "ar-condicionado", "informática", "chaveiro", "câmeras", "montador"] },
  { nome: "Construção", palavrasChave: ["pedreiro", "pintor", "gesseiro", "serralheiro", "marceneiro", "carpinteiro"] },
  { nome: "Beleza e bem-estar", palavrasChave: ["manicure", "cabeleireiro", "maquiador", "personal"] },
];

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function CategoriasView() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarCategorias() {
      try {
        setCarregando(true);
        setErro(null);

        const response = await fetch("/api/categoria?t=" + Date.now(), {
          method: "GET",
          headers: { "Cache-Control": "no-cache" },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar as categorias do servidor.");
        }

        const dados = await response.json();
        setCategorias(Array.isArray(dados) ? dados : []);
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Algo deu errado.");
      } finally {
        setCarregando(false);
      }
    }

    carregarCategorias();
  }, []);

  const categoriasFiltradas = useMemo(() => {
    const termo = normalizar(busca.trim());
    const grupoSelecionado = gruposFiltros.find((grupo) => grupo.nome === filtroAtivo);

    return categorias.filter((categoria) => {
      const nome = normalizar(categoria.nome_categoria);
      const descricao = normalizar(categoria.descricao || "");
      const bateBusca = !termo || nome.includes(termo) || descricao.includes(termo);
      const bateGrupo =
        !grupoSelecionado ||
        grupoSelecionado.nome === "Todos" ||
        grupoSelecionado.palavrasChave.some((palavra) => nome.includes(normalizar(palavra)));

      return bateBusca && bateGrupo;
    });
  }, [busca, categorias, filtroAtivo]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SearchBar />

      <div className="p-8 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Todas as categorias</h1>
              <p className="text-gray-400 text-sm">Encontre o profissional ideal que você precisa</p>
            </div>

            <div className="w-full lg:w-[380px] flex items-center rounded-xl bg-white border border-gray-200 px-4 h-11 shadow-sm focus-within:border-blue-500 transition">
              <Search size={17} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar serviços..."
                className="flex-1 ml-3 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
              <SlidersHorizontal size={16} className="text-gray-400" />
            </div>
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
            {gruposFiltros.map((grupo) => (
              <button
                key={grupo.nome}
                type="button"
                onClick={() => setFiltroAtivo(grupo.nome)}
                className={[
                  "px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                  filtroAtivo === grupo.nome
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
                ].join(" ")}
              >
                {grupo.nome}
              </button>
            ))}
          </div>

          {carregando && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-[216px] bg-white border border-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {erro && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">{erro}</div>
          )}

          {!carregando && !erro && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoriasFiltradas.map((categoria) => (
                <Link
                  key={categoria.id_categoria || categoria.nome_categoria}
                  href={"/buscar?categoria=" + encodeURIComponent(categoria.nome_categoria)}
                  className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-blue-200 transition-all h-[216px] group"
                >
                  <div className="mb-4 rounded-2xl bg-blue-50/70 p-3 group-hover:scale-105 transition-transform">
                    <CategoriaIcon nome={categoria.nome_categoria} className="w-8 h-8" />
                  </div>

                  <h3 className="text-base font-bold text-[#1E293B] mb-1 line-clamp-1">{categoria.nome_categoria}</h3>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2 overflow-hidden px-2">
                    {categoria.descricao || "Prestadores de serviços qualificados prontos para te atender."}
                  </p>

                  <div className="text-[11px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full mt-auto flex items-center gap-1">
                    <UsersRound size={12} />
                    <span>{categoria.total_prestadores || 0} disponíveis na plataforma</span>
                  </div>
                </Link>
              ))}

              {categoriasFiltradas.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white border border-gray-100 rounded-2xl">
                  <p className="text-gray-400 font-medium">Nenhuma categoria encontrada para este filtro.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
