'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, Plus, MapPin, Trash2, Edit3, Eye,
  RotateCcw, ChevronLeft, ChevronRight, FileDown,
  Building2, CheckCircle2, Clock, Ban, Calendar, TrendingUp,
  X, Loader2
} from 'lucide-react';

// ─── Interfaces fiéis ao backend ───────────────────────────────────────────

interface Parceria {
  id_parceria: number;
  nome_parceiro: string;
  cidade: string;
  estado: string;
  status?: string;
  data_inicio: string;
  data_fim?: string;
}

interface CidadeAtendida {
  id_cidade?: number;
  id_parceria: number;
  cidade: string;
  estado: string;
  acesso_gratuito: boolean;
}

type ModalParceriaModo = 'criar' | 'editar' | 'ver' | null;

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

export default function ParceriasPage() {
  // ─── Dados ───────────────────────────────────────────────────────────────
  const [parcerias, setParcerias] = useState<Parceria[]>([]);
  const [cidades, setCidades]     = useState<CidadeAtendida[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadingCidades, setLoadingCidades] = useState(true);

  // ─── Filtros ─────────────────────────────────────────────────────────────
  const [busca, setBusca]             = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // ─── Paginação ───────────────────────────────────────────────────────────
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;

  // ─── Modal de parceria (criar/editar/ver) ───────────────────────────────
  const [modalModo, setModalModo]   = useState<ModalParceriaModo>(null);
  const [parceriaEdit, setParceriaEdit] = useState<Parceria | null>(null);
  const [form, setForm] = useState({
    nome_parceiro: '',
    cidade: '',
    estado: 'PE',
    status: 'ativo',
    data_inicio: '',
    data_fim: '',
  });
  const [salvando, setSalvando] = useState(false);

  // ─── Modal de cidades ────────────────────────────────────────────────────
  const [modalCidadesAberto, setModalCidadesAberto] = useState(false);
  const [novaCidade, setNovaCidade] = useState({ id_parceria: 0, cidade: '', estado: 'PE', acesso_gratuito: false });
  const [salvandoCidade, setSalvandoCidade] = useState(false);

  // ─── Fetch parcerias ─────────────────────────────────────────────────────
  const fetchParcerias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroStatus !== 'todos') params.append('status', filtroStatus);
      if (filtroEstado !== 'todos') params.append('estado', filtroEstado);
      const query = params.toString();
      const res = await fetch(query ? `/api/parceria?${query}` : '/api/parceria');
      const data = await res.json();
      if (Array.isArray(data)) setParcerias(data);
    } catch (error) {
      console.error('Erro ao buscar parcerias:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch cidades ───────────────────────────────────────────────────────
  const fetchCidades = async () => {
    try {
      setLoadingCidades(true);
      const res = await fetch('/api/cidadeAtendida');
      const data = await res.json();
      if (Array.isArray(data)) setCidades(data);
    } catch (e) {
      console.error('Erro ao buscar cidades:', e);
    } finally {
      setLoadingCidades(false);
    }
  };

  useEffect(() => { fetchParcerias(); }, [filtroStatus, filtroEstado]);
  useEffect(() => { fetchCidades(); }, []);

  // ─── Excluir parceria ────────────────────────────────────────────────────
  const handleExcluir = async (id: number) => {
    if (!confirm('Remover esta parceria permanentemente?')) return;
    try {
      const res = await fetch(`/api/parceria/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchParcerias();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Erro ao remover: ${data.error || data.erro || 'Erro desconhecido'}`);
      }
    } catch (e) {
      alert('Erro de conexão ao remover parceria.');
    }
  };

  const handleLimparFiltros = () => {
    setBusca('');
    setFiltroStatus('todos');
    setFiltroEstado('todos');
    setPaginaAtual(1);
  };

  // ─── Abrir modal: criar ──────────────────────────────────────────────────
  const abrirCriar = () => {
    setForm({ nome_parceiro: '', cidade: '', estado: 'PE', status: 'ativo', data_inicio: '', data_fim: '' });
    setParceriaEdit(null);
    setModalModo('criar');
  };

  // ─── Abrir modal: editar ─────────────────────────────────────────────────
  const abrirEditar = (p: Parceria) => {
    setForm({
      nome_parceiro: p.nome_parceiro,
      cidade: p.cidade,
      estado: p.estado,
      status: p.status ?? 'ativo',
      data_inicio: p.data_inicio ? p.data_inicio.slice(0, 10) : '',
      data_fim: p.data_fim ? p.data_fim.slice(0, 10) : '',
    });
    setParceriaEdit(p);
    setModalModo('editar');
  };

  // ─── Abrir modal: ver ────────────────────────────────────────────────────
  const abrirVer = (p: Parceria) => {
    setParceriaEdit(p);
    setModalModo('ver');
  };

  const fecharModal = () => {
    setModalModo(null);
    setParceriaEdit(null);
  };

  // ─── Salvar (criar ou editar) ────────────────────────────────────────────
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome_parceiro.trim() || !form.cidade.trim() || !form.data_inicio) {
      alert('Preencha nome do parceiro, cidade e data de início.');
      return;
    }

    setSalvando(true);
    try {
      const payload: any = {
        nome_parceiro: form.nome_parceiro.trim(),
        cidade: form.cidade.trim(),
        estado: form.estado,
        status: form.status,
        data_inicio: form.data_inicio,
      };
      if (form.data_fim) payload.data_fim = form.data_fim;

      const isEdicao = modalModo === 'editar' && parceriaEdit;
      const url = isEdicao ? `/api/parceria/${parceriaEdit!.id_parceria}` : '/api/parceria';
      const method = isEdicao ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        fecharModal();
        fetchParcerias();
      } else {
        alert(`Erro ao salvar: ${data.error || data.erro || 'Erro desconhecido'}`);
      }
    } catch (error) {
      alert('Erro de conexão ao salvar parceria.');
    } finally {
      setSalvando(false);
    }
  };

  // ─── Exportar CSV ────────────────────────────────────────────────────────
  const handleExportarCSV = () => {
    if (parceriasFiltradas.length === 0) {
      alert('Não há parcerias para exportar com os filtros atuais.');
      return;
    }

    const cabecalho = ['ID', 'Parceiro', 'Cidade', 'Estado', 'Status', 'Data Início', 'Data Fim'];
    const linhas = parceriasFiltradas.map(p => [
      p.id_parceria,
      `"${p.nome_parceiro.replace(/"/g, '""')}"`,
      p.cidade,
      p.estado,
      p.status ?? '',
      p.data_inicio ? new Date(p.data_inicio).toLocaleDateString('pt-BR') : '',
      p.data_fim ? new Date(p.data_fim).toLocaleDateString('pt-BR') : '',
    ]);

    const csvContent = [cabecalho, ...linhas].map(linha => linha.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `parcerias_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ─── Cidades: criar ──────────────────────────────────────────────────────
  const handleCriarCidade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCidade.id_parceria || !novaCidade.cidade.trim()) {
      alert('Selecione a parceria e informe o nome da cidade.');
      return;
    }
    setSalvandoCidade(true);
    try {
      const res = await fetch('/api/cidadeAtendida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_parceria: novaCidade.id_parceria,
          cidade: novaCidade.cidade.trim(),
          estado: novaCidade.estado,
          acesso_gratuito: novaCidade.acesso_gratuito,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setNovaCidade({ id_parceria: 0, cidade: '', estado: 'PE', acesso_gratuito: false });
        fetchCidades();
      } else {
        alert(`Erro ao adicionar cidade: ${data.error || data.erro || 'Erro desconhecido'}`);
      }
    } catch {
      alert('Erro de conexão ao adicionar cidade.');
    } finally {
      setSalvandoCidade(false);
    }
  };

  // ─── Cidades: remover ────────────────────────────────────────────────────
  const handleRemoverCidade = async (id: number) => {
    if (!confirm('Remover esta cidade da lista de atendimento?')) return;
    try {
      const res = await fetch(`/api/cidadeAtendida/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCidades();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Erro ao remover cidade: ${data.error || data.erro || 'Erro desconhecido'}`);
      }
    } catch {
      alert('Erro de conexão ao remover cidade.');
    }
  };

  // ─── Filtros derivados ───────────────────────────────────────────────────
  const parceriasFiltradas = parcerias.filter(p => {
    const nomeValido = p.nome_parceiro?.toLowerCase() || '';
    const cidadeValida = p.cidade?.toLowerCase() || '';
    return nomeValido.includes(busca.toLowerCase()) || cidadeValida.includes(busca.toLowerCase());
  });

  const totalParcerias = parcerias.length;
  const ativasCount = parcerias.filter(p => p.status?.toLowerCase() === 'ativo' || p.status?.toLowerCase() === 'ativa').length;
  const inativasCount = parcerias.filter(p =>
    p.status?.toLowerCase() === 'inativo' || p.status?.toLowerCase() === 'inativa' ||
    p.status?.toLowerCase() === 'encerrado' || p.status?.toLowerCase() === 'suspenso'
  ).length;

  const totalPaginas = Math.ceil(parceriasFiltradas.length / itensPorPagina) || 1;
  const exibidas = parceriasFiltradas.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

  // Agrupa contagem de cidades por estado (para o card lateral)
  const cidadesAgrupadas = cidades.reduce<Record<string, number>>((acc, c) => {
    const key = `${c.cidade}__${c.estado}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const cidadesUnicas = Object.entries(cidadesAgrupadas).map(([key]) => {
    const [cidade, estado] = key.split('__');
    return { cidade, estado };
  });

  return (
    <div className="w-full min-h-screen bg-[#FAFBFF] p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-800">

      {/* ─── TOPO ─── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#1E293B] tracking-tight">Parcerias</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gerencie os vínculos baseados em tabelas reais do banco de dados</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportarCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <FileDown size={15} /> Exportar relatório
          </button>
          <button
            onClick={abrirCriar}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] rounded-xl text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-sm"
          >
            <Plus size={15} /> Nova parceria
          </button>
        </div>
      </div>

      {/* ─── MÉTRICAS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100/80">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-3">
            <Building2 size={20} />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de parcerias</p>
          <h3 className="text-2xl font-black text-[#0F172A] mt-1">{loading ? '...' : totalParcerias}</h3>
        </div>

        <div className="bg-white p-5 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100/80">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-3">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ativas</p>
          <h3 className="text-2xl font-black text-[#0F172A] mt-1">{loading ? '...' : ativasCount}</h3>
        </div>

        <div className="bg-white p-5 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100/80">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 mb-3">
            <Ban size={20} />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inativas</p>
          <h3 className="text-2xl font-black text-[#0F172A] mt-1">{loading ? '...' : inativasCount}</h3>
        </div>
      </div>

      {/* ─── FILTROS ─── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="relative w-full min-w-0 sm:min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por parceiro ou cidade..."
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-slate-200/60 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500/50 transition-all"
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }}
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">Filtrar Status</label>
            <select
              className="bg-[#F8FAFC] border border-slate-200/60 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none"
              value={filtroStatus}
              onChange={(e) => { setFiltroStatus(e.target.value); setPaginaAtual(1); }}
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="encerrado">Encerrado</option>
              <option value="suspenso">Suspenso</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block font-bold mb-1 uppercase tracking-wider">Filtrar Estado (UF)</label>
            <select
              className="bg-[#F8FAFC] border border-slate-200/60 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none"
              value={filtroEstado}
              onChange={(e) => { setFiltroEstado(e.target.value); setPaginaAtual(1); }}
            >
              <option value="todos">Todos Estados</option>
              {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleLimparFiltros}
          className="text-[#2563EB] text-xs font-bold flex items-center gap-1.5 hover:underline"
        >
          <RotateCcw size={13} /> Limpar filtros
        </button>
      </div>

      {/* ─── CONTEÚDO ─── */}
      <div className="grid grid-cols-12 gap-6">

        {/* TABELA */}
        <div className="col-span-12 lg:col-span-9 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Parceiro</th>
                  <th className="px-6 py-4">Localização (Cidade/UF)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Vigência (Início / Fim)</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10">
                      <Loader2 className="animate-spin mx-auto text-slate-400" size={20} />
                    </td>
                  </tr>
                ) : exibidas.length > 0 ? (
                  exibidas.map((item) => (
                    <tr key={`parceria-real-${item.id_parceria}`} className="hover:bg-slate-50/60 transition group">
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">#{item.id_parceria}</td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-[#1E293B] group-hover:text-blue-600 transition-colors">
                          {item.nome_parceiro}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <MapPin size={13} className="text-slate-300" />
                          {item.cidade} - {item.estado}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          item.status?.toLowerCase() === 'ativo' || item.status?.toLowerCase() === 'ativa'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          {item.status || 'Não Informado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                          <Calendar className="text-amber-500" size={13} />
                          <span>{new Date(item.data_inicio).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {item.data_fim && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Clock className="text-orange-500" size={13} />
                            <span>Até {new Date(item.data_fim).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => abrirVer(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                            title="Ver detalhes"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => abrirEditar(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleExcluir(item.id_parceria)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-xs font-semibold text-slate-400">
                      Nenhuma parceria encontrada no banco.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINAÇÃO */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 bg-[#FCFDFE]">
            <p className="font-medium text-[11px]">Mostrando {exibidas.length} de {parceriasFiltradas.length} parcerias</p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={paginaAtual === 1}
                onClick={() => setPaginaAtual(prev => prev - 1)}
                className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPaginas }).map((_, i) => (
                <button
                  key={`pag-real-${i + 1}`}
                  onClick={() => setPaginaAtual(i + 1)}
                  className={`w-7 h-7 rounded-xl text-xs font-bold transition-all ${
                    paginaAtual === i + 1
                      ? 'bg-[#2563EB] text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={paginaAtual === totalPaginas}
                onClick={() => setPaginaAtual(prev => prev + 1)}
                className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* CIDADES ATENDIDAS */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
            <h4 className="text-xs font-extrabold text-[#1E293B] mb-4 tracking-tight">Cidades Atendidas Ativas</h4>
            <div className="space-y-3.5">
              {loadingCidades ? (
                <Loader2 className="animate-spin mx-auto text-slate-400" size={18} />
              ) : (
                cidadesUnicas.slice(0, 7).map((c, i) => {
                  const safeKey = `cidade-${c.cidade}-${c.estado}-${i}`;
                  return (
                    <div key={safeKey} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#1E293B] truncate">{c.cidade || 'Não informada'}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{c.estado || 'UF'}</p>
                      </div>
                      <TrendingUp size={13} className="text-emerald-500 shrink-0" />
                    </div>
                  );
                })
              )}
              {!loadingCidades && cidades.length === 0 && (
                <p className="text-[11px] text-center text-slate-400 py-4 font-semibold">Nenhuma cidade cadastrada no banco.</p>
              )}
            </div>
            <button
              onClick={() => setModalCidadesAberto(true)}
              className="w-full mt-4 py-2 bg-slate-50 border border-slate-100 text-[#2563EB] text-[10px] font-bold rounded-xl hover:bg-blue-50 transition-all"
            >
              Configurar Cidades
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════ MODAL: CRIAR / EDITAR / VER PARCERIA ═══════════════ */}
      {modalModo && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-xl p-6 relative">
            <button
              onClick={fecharModal}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            {modalModo === 'ver' && parceriaEdit ? (
              <>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="text-blue-600" size={20} /> Detalhes da Parceria
                </h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-semibold">Parceiro</span>
                    <span className="font-bold text-slate-800">{parceriaEdit.nome_parceiro}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-semibold">Localização</span>
                    <span className="font-bold text-slate-800">{parceriaEdit.cidade} - {parceriaEdit.estado}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-semibold">Status</span>
                    <span className="font-bold text-slate-800 capitalize">{parceriaEdit.status || 'Não informado'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-semibold">Início</span>
                    <span className="font-bold text-slate-800">{new Date(parceriaEdit.data_inicio).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {parceriaEdit.data_fim && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Fim</span>
                      <span className="font-bold text-slate-800">{new Date(parceriaEdit.data_fim).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => abrirEditar(parceriaEdit)}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
                  >
                    Editar esta parceria
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {modalModo === 'criar'
                    ? <><Plus className="text-blue-600" size={20} /> Nova Parceria</>
                    : <><Edit3 className="text-blue-600" size={20} /> Editar Parceria</>
                  }
                </h3>

                <form onSubmit={handleSalvar} className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nome do parceiro</label>
                    <input
                      type="text"
                      value={form.nome_parceiro}
                      onChange={(e) => setForm({ ...form, nome_parceiro: e.target.value })}
                      placeholder="Ex: Prefeitura de Garanhuns"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Cidade</label>
                      <input
                        type="text"
                        value={form.cidade}
                        onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                        placeholder="Ex: Garanhuns"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Estado</label>
                      <select
                        value={form.estado}
                        onChange={(e) => setForm({ ...form, estado: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      >
                        {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="encerrado">Encerrado</option>
                      <option value="suspenso">Suspenso</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Data de início</label>
                      <input
                        type="date"
                        value={form.data_inicio}
                        onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Data de fim <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                      </label>
                      <input
                        type="date"
                        value={form.data_fim}
                        onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={fecharModal}
                      className="px-4 py-2 text-sm font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={salvando}
                      className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50"
                    >
                      {salvando ? 'Salvando...' : modalModo === 'criar' ? 'Criar parceria' : 'Salvar alterações'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL: CONFIGURAR CIDADES ═══════════════ */}
      {modalCidadesAberto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-xl p-6 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setModalCidadesAberto(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="text-blue-600" size={20} /> Configurar Cidades
            </h3>
            <p className="text-sm text-slate-400 mt-1">Vincule cidades atendidas a uma parceria existente.</p>

            {/* Form de nova cidade */}
            <form onSubmit={handleCriarCidade} className="mt-4 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Parceria</label>
                <select
                  value={novaCidade.id_parceria}
                  onChange={(e) => setNovaCidade({ ...novaCidade, id_parceria: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value={0}>Selecione uma parceria...</option>
                  {parcerias.map(p => (
                    <option key={p.id_parceria} value={p.id_parceria}>
                      #{p.id_parceria} — {p.nome_parceiro}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Cidade</label>
                  <input
                    type="text"
                    value={novaCidade.cidade}
                    onChange={(e) => setNovaCidade({ ...novaCidade, cidade: e.target.value })}
                    placeholder="Nome da cidade"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Estado</label>
                  <select
                    value={novaCidade.estado}
                    onChange={(e) => setNovaCidade({ ...novaCidade, estado: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  >
                    {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={novaCidade.acesso_gratuito}
                  onChange={(e) => setNovaCidade({ ...novaCidade, acesso_gratuito: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600"
                />
                Acesso gratuito nesta cidade
              </label>

              <button
                type="submit"
                disabled={salvandoCidade}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
              >
                {salvandoCidade ? 'Adicionando...' : 'Adicionar cidade'}
              </button>
            </form>

            {/* Lista de cidades cadastradas */}
            <div className="mt-5">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Cidades cadastradas ({cidades.length})</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {cidades.map((c) => {
                  const parceria = parcerias.find(p => p.id_parceria === c.id_parceria);
                  return (
                    <div key={c.id_cidade} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{c.cidade} - {c.estado}</p>
                        <p className="text-[10px] text-slate-400">
                          {parceria ? parceria.nome_parceiro : `Parceria #${c.id_parceria}`}
                          {c.acesso_gratuito && <span className="text-emerald-500 font-bold ml-1">• Gratuito</span>}
                        </p>
                      </div>
                      <button
                        onClick={() => c.id_cidade && handleRemoverCidade(c.id_cidade)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
                {cidades.length === 0 && (
                  <p className="text-[11px] text-center text-slate-400 py-4 font-semibold">Nenhuma cidade cadastrada ainda.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
