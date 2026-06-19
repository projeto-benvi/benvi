'use client';

import React, { useState, useEffect } from 'react';

interface Parceria {
  id_parceria: number;
  nome_parceiro: string;
  cidade: string;
  estado: string;
  status: string;
  data_inicio: string;
  data_fim?: string;
}

export default function ParceriasAtivas() {
  const [parcerias, setParcerias] = useState<Parceria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadParcerias() {
      try {
        setLoading(true);
        const resParcerias = await fetch(`/api/parceria?status=ativo`);
        const dataParcerias = await resParcerias.json();
        setParcerias(Array.isArray(dataParcerias) ? dataParcerias : []);
      } catch (error) {
        console.error("Erro ao carregar as parcerias:", error);
      } finally {
        setLoading(false);
      }
    }

    loadParcerias();
  }, []);

  // Filtro de segurança extra — garante que só renderiza status 'ativo'
  const parceriasAtivas = parcerias.filter(
    (p) => p.status?.toLowerCase() === 'ativo' || p.status?.toLowerCase() === 'ativa'
  );

  if (loading) {
    return (
      <div className="p-6 text-center text-sm font-medium text-indigo-600 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center min-h-[220px]">
        A carregar parcerias ativas...
      </div>
    );
  }

  return (
    <div className="bg-white m-10 p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full min-h-[220px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-900">
          Parcerias ativas
          <span className="text-xs font-semibold text-slate-400 ml-2">({parceriasAtivas.length})</span>
        </h2>
        <a href="/admin/dashboard" className="text-sm font-semibold text-indigo-600 hover:underline">Voltar</a>
      </div>

      {/* ✅ Sem .slice() — renderiza todas as parcerias ativas que existirem.
          O grid quebra linha automaticamente conforme a quantidade. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {parceriasAtivas.length > 0 ? (
          parceriasAtivas.map((item) => (
            <div key={item.id_parceria} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center justify-between min-h-[140px] transition hover:shadow-sm">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-lg">
                🏛️
              </div>
              <div className="my-2 w-full">
                <p className="text-[11px] font-bold text-slate-800 leading-tight truncate px-1">
                  {item.nome_parceiro}
                </p>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">
                  {item.cidade} - {item.estado}
                </p>
              </div>
              <span className="text-[9px] font-bold px-3 py-0.5 rounded-full bg-amber-100 text-amber-700">
                Convênio
              </span>
            </div>
          ))
        ) : (
          <p className="col-span-2 sm:col-span-4 text-center text-xs text-slate-400 py-8">
            Nenhuma parceria ativa no momento.
          </p>
        )}
      </div>
    </div>
  );
}
