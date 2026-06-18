'use client';

import React, { useState, useEffect } from 'react';

interface CidadeAtendida {
  id_cidade: number;
  id_parceria: number;
  cidade: string;
  estado: string;
  acesso_gratuito: boolean;
}

export default function ParceriasAtivas() {
  const [cidades, setCidades] = useState<CidadeAtendida[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCidades() {
      try {
        setLoading(true);
        // Faz a chamada para a sua API de cidades atendidas
        const res = await fetch('/api/cidadeAtendida');
        const data = await res.json();
        
        // Armazena os dados (mostrando até as 4 primeiras parcerias no carrossel/grade)
        setCidades(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar as parcerias:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCidades();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-sm font-medium text-indigo-600 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center min-h-[220px]">
        A carregar parcerias ativas...
      </div>
    );
  }

  return (
    <div className="bg-white m-10 p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-full min-h-[220px]">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Parcerias ativas</h2>
          <a href="/admin/dashboard" className="text-sm font-semibold text-indigo-600 hover:underline">Voltar</a>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {cidades.length > 0 ? (
            // Renderização dinâmica dos dados reais vindos da API
            cidades.slice(0, 4).map((item) => (
              <div key={item.id_cidade} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center justify-between min-h-[140px] transition hover:shadow-sm">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-lg">
                  🏛️
                </div>
                <div className="my-2 w-full">
                  <p className="text-[11px] font-bold text-slate-800 leading-tight truncate px-1">
                    Prefeitura de {item.cidade}
                  </p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">
                    {item.cidade} - {item.estado}
                  </p>
                </div>
                <span className={`text-[9px] font-bold px-3 py-0.5 rounded-full ${
                  item.acesso_gratuito ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.acesso_gratuito ? 'Gratuito' : 'Convênio'}
                </span>
              </div>
            ))
          ) : (
            // Fallback visual com Mock do Design caso a tabela do Banco de Dados esteja vazia
            <>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center justify-between min-h-[140px]">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-lg">🏛️</div>
                <div className="my-2">
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">Prefeitura de Garanhuns</p>
                  <p className="text-[9px] text-slate-400">Garanhuns - PE</p>
                </div>
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-3 py-0.5 rounded-full">Ativa</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center justify-between min-h-[140px]">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">🏛️</div>
                <div className="my-2">
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">Prefeitura de Jupi</p>
                  <p className="text-[9px] text-slate-400">Jupi - PE</p>
                </div>
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-3 py-0.5 rounded-full">Ativa</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center justify-between min-h-[140px]">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-lg">🏛️</div>
                <div className="my-2">
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">Prefeitura de Águas Belas</p>
                  <p className="text-[9px] text-slate-400">Águas Belas - PE</p>
                </div>
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-3 py-0.5 rounded-full">Ativa</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center justify-between min-h-[140px]">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-lg">🏛️</div>
                <div className="my-2">
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">Prefeitura de Caetés</p>
                  <p className="text-[9px] text-slate-400">Caetés - PE</p>
                </div>
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-3 py-0.5 rounded-full">Ativa</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Paginação visual do Carrossel inferior */}
      <div className="flex justify-center gap-1.5 mt-4">
        <span className="w-2 h-2 rounded-full bg-indigo-600" />
        <span className="w-2 h-2 rounded-full bg-slate-200" />
        <span className="w-2 h-2 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}