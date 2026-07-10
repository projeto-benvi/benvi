'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, AlertCircle, Clock, CheckCircle2, Archive,
  Trash2, Eye, X, ChevronLeft, ChevronRight, RotateCcw, ShieldAlert
} from 'lucide-react';

// --- Interfaces Baseadas nos Modelos Reais do seu Backend ---
interface Reporte {
  id_reporte: number;
  assunto: string;
  arquivo?: string | null;
  tipo_problema: string;
  descricao: string;
  status: 'pendente' | 'em_analise' | 'resolvido' | 'arquivado' | string;
  data_reporte: string;
  id_usuario_reportou: number;
  nome_reportou: string;
  email_reportou: string;
  foto_reportou?: string | null;
  id_usuario_reportado: number;
  nome_reportado: string;
  email_reportado: string;
  foto_reportado?: string | null;
  id_admin?: number | null;
  nome_admin?: string | null;
}

interface MetricsReportes {
  total: number;
  pendentes: number;
  emAnalise: number;
  resolvidos: number;
  arquivados: number;
}

export default function AdminReportPage() {
  // Estados de Dados
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [metrics, setMetrics] = useState<MetricsReportes>({ 
    total: 0, pendentes: 0, emAnalise: 0, resolvidos: 0, arquivados: 0 
  });
  const [loading, setLoading] = useState(true);

  // Estados de Filtros e Paginação
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Seleção múltipla (Checkbox)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Buscar os reportes da API real do seu Backend
  async function fetchReportes() {
    try {
      setLoading(true);
      const res = await fetch(`/api/reporte`);
      if (!res.ok) throw new Error('Falha ao buscar dados');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setReportes(data);
        calcularMetricas(data);
      }
    } catch (error) {
      console.error("Erro ao carregar reportes:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReportes();
  }, []);

  // Calcular métricas em tempo real com base nos status do backend
  const calcularMetricas = (lista: Reporte[]) => {
    const pendentes = lista.filter(r => r.status === 'pendente').length;
    const emAnalise = lista.filter(r => r.status === 'em_analise').length;
    const resolvidos = lista.filter(r => r.status === 'resolvido').length;
    const arquivados = lista.filter(r => r.status === 'arquivado').length;

    setMetrics({
      total: lista.length,
      pendentes,
      emAnalise,
      resolvidos,
      arquivados
    });
  };

  // Função para deletar um reporte individualmente
  const handleDeleteIndividual = async (id: number) => {
    if (!confirm(`Deseja realmente deletar o reporte #${id}?`)) return;
    try {
      const res = await fetch(`/api/reporte/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const novosReportes = reportes.filter(r => r.id_reporte !== id);
        setReportes(novosReportes);
        calcularMetricas(novosReportes);
        setSelectedIds(prev => prev.filter(item => item !== id));
      } else {
        alert("Erro ao remover o reporte.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Lógica de manipulação de Checkboxes
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const currentIds = currentItems.map(r => r.id_reporte);
      setSelectedIds(prev => Array.from(new Set([...prev, ...currentIds])));
    } else {
      const currentIds = currentItems.map(r => r.id_reporte);
      setSelectedIds(prev => prev.filter(id => !currentIds.includes(id)));
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filtragem dos dados
  const filteredItems = reportes.filter(reporte => {
    const matchesBusca = 
      reporte.id_reporte.toString().includes(busca) ||
      reporte.assunto.toLowerCase().includes(busca.toLowerCase()) ||
      reporte.nome_reportou.toLowerCase().includes(busca.toLowerCase()) ||
      reporte.nome_reportado.toLowerCase().includes(busca.toLowerCase());

    const matchesStatus = filtroStatus === 'todos' || reporte.status === filtroStatus;
    const matchesTipo = filtroTipo === 'todos' || reporte.tipo_problema === filtroTipo;

    return matchesBusca && matchesStatus && matchesTipo;
  });

  // Paginação
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const formatarData = (dataStr: string) => {
    try {
      const d = new Date(dataStr);
      return {
        data: d.toLocaleDateString('pt-BR'),
        hora: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
    } catch {
      return { data: dataStr, hora: '' };
    }
  };

  // Função auxiliar de estilização de crachá de Status
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'em_analise': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'resolvido': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'arquivado': return 'bg-slate-100 text-slate-600 border border-slate-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="text-indigo-600" size={28} /> Reportes
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Analise denúncias entre utilizadores, trate violações de diretrizes e controle contas afetadas.
            </p>
          </div>
          <button 
            onClick={fetchReportes}
            className="self-start sm:self-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2"
          >
            <RotateCcw size={16} /> Atualizar Lista
          </button>
        </div>

        {/* Top Indicators / Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><ShieldAlert size={22} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</p>
              <p className="text-xl font-bold text-slate-700 mt-0.5">{metrics.total}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertCircle size={22} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pendentes</p>
              <p className="text-xl font-bold text-slate-700 mt-0.5">{metrics.pendentes}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Clock size={22} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Em Análise</p>
              <p className="text-xl font-bold text-slate-700 mt-0.5">{metrics.emAnalise}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={22} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolvidos</p>
              <p className="text-xl font-bold text-slate-700 mt-0.5">{metrics.resolvidos}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><Archive size={22} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Arquivados</p>
              <p className="text-xl font-bold text-slate-700 mt-0.5">{metrics.arquivados}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar Container */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center bg-white">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por ID, assunto, denunciante ou denunciado..."
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={filtroStatus}
                onChange={(e) => { setFiltroStatus(e.target.value); setCurrentPage(1); }}
                className="border border-slate-200 text-sm font-medium rounded-xl px-3 py-2.5 bg-white text-slate-600 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="todos">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="em_analise">Em Análise</option>
                <option value="resolvido">Resolvido</option>
                <option value="arquivado">Arquivado</option>
              </select>

              <select
                value={filtroTipo}
                onChange={(e) => { setFiltroTipo(e.target.value); setCurrentPage(1); }}
                className="border border-slate-200 text-sm font-medium rounded-xl px-3 py-2.5 bg-white text-slate-600 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="comportamento">Comportamento</option>
                <option value="fraude">Fraude / Golpe</option>
                <option value="plataforma">Erro na Plataforma</option>
                <option value="outro">Outros</option>
              </select>
            </div>
          </div>

          {/* Table / Cards Layout */}
          {loading ? (
            <div className="p-20 text-center text-slate-400 font-medium flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              A carregar reportes...
            </div>
          ) : currentItems.length === 0 ? (
            <div className="p-20 text-center text-slate-400 font-medium">
              Nenhum reporte encontrado para os filtros selecionados.
            </div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-4 w-12 text-center">
                        <input 
                          type="checkbox" 
                          onChange={handleSelectAll}
                          checked={currentItems.every(r => selectedIds.includes(r.id_reporte))}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                      </th>
                      <th className="p-4 w-16">ID</th>
                      <th className="p-4">Envolvidos (Denunciante / Alvo)</th>
                      <th className="p-4">Motivo & Assunto</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Data e Hora</th>
                      <th className="p-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {currentItems.map((reporte) => {
                      const dt = formatarData(reporte.data_reporte);
                      return (
                        <tr key={reporte.id_reporte} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={selectedIds.includes(reporte.id_reporte)}
                              onChange={() => handleSelectRow(reporte.id_reporte)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                            />
                          </td>
                          <td className="p-4 font-semibold text-slate-400">#{reporte.id_reporte}</td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-200">De:</span>
                                <span className="font-bold text-slate-800">{reporte.nome_reportou}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded border border-red-200">Contra:</span>
                                <span className="font-medium text-slate-600">{reporte.nome_reportado || reporte.nome_reportado}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 max-w-xs lg:max-w-md">
                            <div className="font-semibold text-slate-900 truncate">{reporte.assunto}</div>
                            <div className="text-xs text-slate-400 truncate mt-0.5">{reporte.descricao}</div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getBadgeStyle(reporte.status)}`}>
                              {reporte.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-slate-500">
                            <div className="font-semibold text-slate-700">{dt.data}</div>
                            <div className="mt-0.5 text-slate-400">às {dt.hora}</div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <a 
                                href={`/admin/reportes/verificar?id=${reporte.id_reporte}`}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                                title="Analisar Reporte"
                              >
                                <Eye size={18} />
                              </a>
                              <button 
                                onClick={() => handleDeleteIndividual(reporte.id_reporte)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                                title="Excluir"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card list */}
              <div className="block md:hidden divide-y divide-slate-100">
                {currentItems.map((reporte) => {
                  const dt = formatarData(reporte.data_reporte);
                  return (
                    <div key={reporte.id_reporte} className="p-4 space-y-3 bg-white hover:bg-slate-50/40 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(reporte.id_reporte)}
                            onChange={() => handleSelectRow(reporte.id_reporte)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <span className="text-xs font-bold text-slate-400">#{reporte.id_reporte}</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${getBadgeStyle(reporte.status)}`}>
                          {reporte.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-sm space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <p><span className="text-xs font-semibold text-slate-400 mr-1">De:</span> <span className="font-bold text-slate-800">{reporte.nome_reportou}</span></p>
                        <p><span className="text-xs font-semibold text-slate-400 mr-1">Contra:</span> <span className="font-medium text-slate-700">{reporte.nome_reportado || reporte.nome_reportado}</span></p>
                      </div>

                      <div>
                        <div className="font-bold text-slate-900 text-sm">{reporte.assunto}</div>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{reporte.descricao}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                        <span className="text-slate-400">{dt.data} às {dt.hora}</span>
                        <div className="flex gap-1">
                          <a 
                            href={`/admin/reportes/verificar?id=${reporte.id_reporte}`}
                            className="text-indigo-600 hover:bg-indigo-50 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                          >
                            <Eye size={14} /> Analisar
                          </a>
                          <button 
                            onClick={() => handleDeleteIndividual(reporte.id_reporte)}
                            className="text-red-500 hover:bg-red-50 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Deletar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between flex-col sm:flex-row gap-3 bg-white text-xs text-slate-500 font-medium">
                <div>
                  Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredItems.length)} de {filteredItems.length} denúncias
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 font-bold rounded-lg">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}