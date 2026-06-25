"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MapPin, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; // 1. Importar o hook para ler parâmetros da URL

interface Prestador {
  id_usuario: number;
  nome: string;
  foto_perfil: string;
  cidade: string;
  email: string;
  telefone: string;
  descricao_profissional: string;
  categoria_principal: string;
  status_verificado: boolean;
  status_social: string;
}

const CATEGORIAS = [
  "Todas",
  "Eletricista", "Encanador", "Pedreiro", "Pintor", "Diarista",
  "Faxineira", "Jardineiro", "Marceneiro", "Serralheiro",
  "Técnico em Ar-condicionado", "Técnico em Informática",
  "Montador de Móveis", "Chaveiro", "Gesseiro", "Instalador de Câmeras",
  "Manicure e Pedicure", "Cabeleireiro", "Maquiador(a)", "Designer Gráfico",
  "Fotógrafo", "Personal Trainer", "Professor Particular / Reforço Escolar",
  "Cuidador de Idosos", "Babá", "Lavador de Carros / Estética Automotiva",
  "Motoboy / Entregador Particular", "Costureira / Ajustes de Roupas",
  "Confeiteira / Bolos e Doces", "Decorador(a) de Eventos",
  "Social Media / Gestor de Redes Sociais"
];

export default function BuscarServicosView() {
  const searchParams = useSearchParams(); // 2. Inicializar os parâmetros de busca
  const qParam = searchParams.get("q") || ""; // Pega o valor do "?q=" se ele existir

  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  // 3. Inicializar o estado "termo" com o valor vindo da URL (da SearchBar)
  const [termo, setTermo] = useState(qParam); 
  
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [apenasVerificados, setApenasVerificados] = useState(false);

  // 4. Se o usuário digitar algo na SearchBar enquanto JÁ está na página de busca, 
  // esse useEffect atualiza o input local instantaneamente.
  useEffect(() => {
    setTermo(qParam);
  }, [qParam]);

  useEffect(() => {
    fetch("/api/prestador")
      .then(res => res.json())
      .then(dados => setPrestadores(Array.isArray(dados) ? dados : []))
      .catch(() => setPrestadores([]))
      .finally(() => setCarregando(false));
  }, []);

  const prestadoresFiltrados = prestadores.filter(p => {
    const termoLower = termo.toLowerCase();
    const bateTermos =
      !termo ||
      p.nome?.toLowerCase().includes(termoLower) ||
      p.categoria_principal?.toLowerCase().includes(termoLower) ||
      p.descricao_profissional?.toLowerCase().includes(termoLower) ||
      p.cidade?.toLowerCase().includes(termoLower);

    const bateCategoria =
      categoriaSelecionada === "Todas" ||
      p.categoria_principal === categoriaSelecionada;

    const bateVerificado = !apenasVerificados || Boolean(p.status_verificado);

    return bateTermos && bateCategoria && bateVerificado;
  });

  const limparFiltros = () => {
    setTermo("");
    setCategoriaSelecionada("Todas");
    setApenasVerificados(false);
  };

  const temFiltrosAtivos = termo || categoriaSelecionada !== "Todas" || apenasVerificados;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Buscar Profissionais</h1>
        <p className="text-sm text-gray-500 mt-1">Encontre profissionais de confiança para o que você precisa</p>
      </div>

      {/* Barra de busca */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 flex items-center border border-gray-200 rounded-xl px-4 h-12 bg-white shadow-sm focus-within:border-blue-500 transition">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={termo}
            onChange={e => setTermo(e.target.value)}
            placeholder="Buscar por nome, categoria ou cidade..."
            className="flex-1 ml-3 text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
          {termo && (
            <button onClick={() => setTermo("")} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className={`flex items-center gap-2 px-4 h-12 rounded-xl border text-sm font-semibold transition cursor-pointer ${
            mostrarFiltros || temFiltrosAtivos
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
          }`}
        >
          <Filter size={16} />
          Filtros
          {temFiltrosAtivos && (
            <span className="bg-white text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {[termo, categoriaSelecionada !== "Todas", apenasVerificados].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Painel de filtros */}
      {mostrarFiltros && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Filtros</h3>
            {temFiltrosAtivos && (
              <button onClick={limparFiltros} className="text-xs text-blue-600 font-bold hover:text-blue-700 cursor-pointer">
                Limpar tudo
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 mb-2 block">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaSelecionada(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    categoriaSelecionada === cat
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setApenasVerificados(!apenasVerificados)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                apenasVerificados ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                apenasVerificados ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
            <span className="text-sm text-gray-700 font-medium">Apenas prestadores verificados</span>
          </div>
        </div>
      )}

      {/* Contador */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          {carregando ? "Buscando..." : `${prestadoresFiltrados.length} profissional${prestadoresFiltrados.length !== 1 ? "is" : ""} encontrado${prestadoresFiltrados.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Cards */}
      {carregando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : prestadoresFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
            <Search size={28} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-400">Nenhum profissional encontrado</p>
          {temFiltrosAtivos && (
            <button onClick={limparFiltros} className="text-xs text-blue-600 font-bold hover:text-blue-700 cursor-pointer">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {prestadoresFiltrados.map(prestador => (
            <Link
              key={prestador.id_usuario}
              href={`/perfil/prestador/${prestador.id_usuario}`} 
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition group block"
            >
              {/* Header do card */}
              <div className="flex items-center gap-4 mb-4">
                {prestador.foto_perfil ? (
                  <img
                    src={prestador.foto_perfil}
                    alt={prestador.nome}
                    className="w-14 h-14 rounded-full object-cover border border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
                    {prestador.nome?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-bold text-gray-900 truncate">{prestador.nome}</p>
                    {Boolean(prestador.status_verificado) && (
                      <span className="text-[9px] bg-green-50 text-green-600 font-bold px-1.5 py-0.5 rounded-full shrink-0">✓ Verificado</span>
                    )}
                  </div>
                  {prestador.categoria_principal && (
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {prestador.categoria_principal}
                    </span>
                  )}
                </div>
              </div>

              {/* Descrição */}
              {prestador.descricao_profissional && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                  {prestador.descricao_profissional}
                </p>
              )}

              {/* Rodapé */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                {prestador.cidade ? (
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <MapPin size={11} />
                    {prestador.cidade}
                  </div>
                ) : <div />}
                <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 transition">
                  Ver perfil →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}