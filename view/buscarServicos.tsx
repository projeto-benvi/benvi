"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Star, Clock, ChevronDown, X } from "lucide-react";

interface Servico {
  id_servico: number;
  id_prestador: number;
  titulo: string;
  descricao: string;
  status_servico: string;
  imagens: string[];
  nome_prestador: string;
  foto_prestador: string;
  cidade_prestador: string;
  nome_categoria: string;
  categoria_principal: string;
  status_verificado: boolean;
  descricao_profissional: string;
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
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [termo, setTermo] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [apenasVerificados, setApenasVerificados] = useState(false);

  useEffect(() => {
  fetch("/api/servico")
      .then(res => res.json())
      .then(dados => setServicos(Array.isArray(dados) ? dados : []))
      .catch(() => setServicos([]))
      .finally(() => setCarregando(false));
  }, []);

  const servicosFiltrados = servicos.filter(s => {
    const termoLower = termo.toLowerCase();
    const bateTermos =
      !termo ||
      s.titulo?.toLowerCase().includes(termoLower) ||
      s.descricao?.toLowerCase().includes(termoLower) ||
      s.nome_prestador?.toLowerCase().includes(termoLower) ||
      s.nome_categoria?.toLowerCase().includes(termoLower);

    const bateCategoria =
      categoriaSelecionada === "Todas" ||
      s.nome_categoria === categoriaSelecionada ||
      s.categoria_principal === categoriaSelecionada;

    const bateVerificado = !apenasVerificados || s.status_verificado;

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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Buscar Serviços</h1>
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
            placeholder="Buscar por serviço, profissional ou categoria..."
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

          {/* Categorias */}
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

          {/* Apenas verificados */}
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

      {/* Resultado */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {carregando ? "Buscando..." : `${servicosFiltrados.length} serviço${servicosFiltrados.length !== 1 ? "s" : ""} encontrado${servicosFiltrados.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Cards */}
      {carregando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
              <div className="w-full h-36 bg-gray-100 rounded-xl mb-4" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : servicosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
            <Search size={28} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-400">Nenhum serviço encontrado</p>
          {temFiltrosAtivos && (
            <button onClick={limparFiltros} className="text-xs text-blue-600 font-bold hover:text-blue-700 cursor-pointer">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {servicosFiltrados.map(servico => {
            const imagens = typeof servico.imagens === "string"
              ? JSON.parse(servico.imagens)
              : servico.imagens ?? [];

            return (
              <div key={servico.id_servico} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer">
                
                {/* Imagem */}
                <div className="w-full h-40 bg-gray-100 overflow-hidden">
                  {imagens.length > 0 ? (
                    <img
                      src={imagens[0]}
                      alt={servico.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-medium">
                      Sem foto
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-gray-900 leading-snug">{servico.titulo}</h3>
                    {servico.nome_categoria && (
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full shrink-0">
                        {servico.nome_categoria}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2">{servico.descricao}</p>

                  {/* Prestador */}
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                    {servico.foto_prestador ? (
                      <img
                        src={servico.foto_prestador}
                        alt={servico.nome_prestador}
                        className="w-7 h-7 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {servico.nome_prestador?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-semibold text-gray-700 truncate">{servico.nome_prestador}</p>
                       {Boolean(servico.status_verificado) && (
                          <span className="text-[9px] bg-green-50 text-green-600 font-bold px-1.5 py-0.5 rounded-full shrink-0">✓ Verificado</span>
                        )}
                      </div>
                      {servico.cidade_prestador && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                          <MapPin size={10} />
                          {servico.cidade_prestador}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}