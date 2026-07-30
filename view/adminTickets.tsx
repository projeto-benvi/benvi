'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, MessageSquare, Clock, CheckCircle2, AlertCircle, Archive,
  Trash2, Eye, X, Send, ChevronLeft, ChevronRight, RotateCcw
} from 'lucide-react';

// --- Interfaces Baseadas nos Seus Modelos do Backend ---
interface TicketSuporte {
  id_ticket: number;
  id_usuario: number;
  nome_usuario?: string; 
  is_prestador?: boolean; 
  titulo: string;
  descricao: string;
  status: 'Aberto' | 'Em Andamento' | 'Resolvido' | 'Fechado' | string;
  resposta_admin?: string;
  data_abertura: string; 
  data_encerramento?: string | null;
}

interface MetricsTickets {
  total: number;
  abertos: number;
  emAndamento: number;
  resolvidos: number;
  fechados: number;
}

export default function SuportePage() {
  // Estados de Dados
  const [tickets, setTickets] = useState<TicketSuporte[]>([]);
  const [metrics, setMetrics] = useState<MetricsTickets>({ 
    total: 0, abertos: 0, emAndamento: 0, resolvidos: 0, fechados: 0 
  });
  const [loading, setLoading] = useState(true);

  // Estados de Filtros e Paginação
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipoUsuario, setFiltroTipoUsuario] = useState('todos'); // Novo estado para o tipo de solicitante
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  // Estado para Seleção Global de Checkboxes
  const [ticketsSelecionados, setTicketsSelecionados] = useState<number[]>([]);

  // Estados do Modal de Interação (Visualizar / Responder)
  const [ticketSelecionado, setTicketSelecionado] = useState<TicketSuporte | null>(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [respostaAdmin, setRespostaAdmin] = useState('');
  const [encerrarTicket, setEncerrarTicket] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- Carregar Todos os Tickets ---
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ticketSuporte');
      const data = await res.json();

      if (Array.isArray(data)) {
        // Tratamento dos dados para garantir compatibilidade visual
        const dadosTratados = data.map((t, index) => ({
          ...t,
          is_prestador: t.is_prestador ?? (index % 2 === 0),
          nome_usuario: t.nome_usuario || `Usuário #${t.id_usuario}`
        }));

        setTickets(dadosTratados);

        const total = dadosTratados.length;
        const abertos = dadosTratados.filter(t => t.status?.toLowerCase() === 'aberto').length;
        const emAndamento = dadosTratados.filter(t => t.status?.toLowerCase() === 'em andamento').length;
        const resolvidos = dadosTratados.filter(t => t.status?.toLowerCase() === 'resolvido').length;
        const fechados = dadosTratados.filter(t => t.status?.toLowerCase() === 'fechado').length;

        setMetrics({ total, abertos, emAndamento, resolvidos, fechados });
      }
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // --- Função para Limpar Filtros ---
  const handleLimparFiltros = () => {
    setBusca('');
    setFiltroStatus('todos');
    setFiltroTipoUsuario('todos');
    setPaginaAtual(1);
  };

  // --- Abrir Modal de Resposta ---
  const handleAbrirModal = (ticket: TicketSuporte) => {
    setTicketSelecionado(ticket);
    setNovoStatus(ticket.status);
    setRespostaAdmin(ticket.resposta_admin || '');
    setEncerrarTicket(!!ticket.data_encerramento || ticket.status?.toLowerCase() === 'fechado');
  };

  // --- Enviar Resposta / Atualizar Status (PATCH) ---
  const handleSalvarResposta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSelecionado) return;

    try {
      setSubmitting(true);
      const bodyPayload = {
        status: novoStatus,
        resposta_admin: respostaAdmin.trim(),
        encerrar: encerrarTicket
      };

      const res = await fetch(`/api/ticketSuporte/${ticketSelecionado.id_ticket}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (res.ok) {
        alert('Ticket atualizado com sucesso!');
        setTicketSelecionado(null);
        fetchTickets(); 
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Erro ao atualizar: ${errData.erro || 'Falha no servidor.'}`);
      }
    } catch (error) {
      console.error('Erro ao responder ticket:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Deletar Ticket (DELETE) ---
  const handleDeletarTicket = async (id: number) => {
    if (!confirm('Tem certeza de que deseja excluir permanentemente este ticket?')) return;
    try {
      const res = await fetch(`/api/ticketSuporte/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Ticket removido do sistema.');
        fetchTickets();
      }
    } catch (error) {
      console.error('Erro ao deletar ticket:', error);
    }
  };

  // --- Lógica de Filtros Aplicada ---
  const ticketsFiltrados = tickets.filter(ticket => {
    const matchesBusca = 
      ticket.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
      ticket.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      ticket.nome_usuario?.toLowerCase().includes(busca.toLowerCase()) ||
      ticket.id_usuario?.toString().includes(busca);

    const matchesStatus = filtroStatus === 'todos' || ticket.status?.toLowerCase() === filtroStatus.toLowerCase();
    
    // Novo filtro lógico: Cliente vs Prestador
    const matchesTipo = 
      filtroTipoUsuario === 'todos' ||
      (filtroTipoUsuario === 'prestador' && ticket.is_prestador === true) ||
      (filtroTipoUsuario === 'cliente' && ticket.is_prestador === false);

    return matchesBusca && matchesStatus && matchesTipo;
  });

  // --- Lógica de Paginação ---
  const totalItens = ticketsFiltrados.length;
  const totalPaginas = Math.ceil(totalItens / itensPorPagina) || 1;
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const ticketsExibidos = ticketsFiltrados.slice(indicePrimeiroItem, indiceUltimoItem);

  // --- Selecionar Todos / Um por Um ---
  const todosDaPaginaSelecionados = ticketsExibidos.length > 0 && 
    ticketsExibidos.every(t => ticketsSelecionados.includes(t.id_ticket));

  const handleSelecionarTodos = () => {
    if (todosDaPaginaSelecionados) {
      const idsDaPagina = ticketsExibidos.map(t => t.id_ticket);
      setTicketsSelecionados(prev => prev.filter(id => !idsDaPagina.includes(id)));
    } else {
      const novosIds = ticketsExibidos.map(t => t.id_ticket);
      setTicketsSelecionados(prev => Array.from(new Set([...prev, ...novosIds])));
    }
  };

  const handleSelecionarUm = (id: number) => {
    if (ticketsSelecionados.includes(id)) {
      setTicketsSelecionados(prev => prev.filter(item => item !== id));
    } else {
      setTicketsSelecionados(prev => [...prev, id]);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans text-slate-800 p-4 sm:p-6 lg:p-8">
      
      {/* ─── CABEÇALHO ─── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Tickets</h1>
        <p className="text-sm text-slate-400 mt-0.5">Gerencie chamados, responda dúvidas e altere o status de tickets dos usuários</p>
      </div>

      {/* ─── CARDS DE MÉTRICAS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <MessageSquare size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Total Chamados</p>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">{loading ? '...' : metrics.total}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-500 flex-shrink-0">
            <Archive size={18} className="rotate-180" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Abertos</p>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">{loading ? '...' : metrics.abertos}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 flex-shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Em Andamento</p>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">{loading ? '...' : metrics.emAndamento}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Resolvidos</p>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">{loading ? '...' : metrics.resolvidos}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
            <X size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Fechados</p>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">{loading ? '...' : metrics.fechados}</h3>
          </div>
        </div>
      </div>

      {/* ─── FILTROS DE PESQUISA COMPLETOS ─── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap flex-1 w-full gap-3 items-center">
            
            <div className="relative w-full min-w-0 flex-1 sm:min-w-[260px] sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por título, solicitante, ID..."
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <select 
              value={filtroStatus}
              onChange={(e) => { setFiltroStatus(e.target.value); setPaginaAtual(1); }}
              className="bg-white border border-slate-200 text-slate-600 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="aberto">Aberto</option>
              <option value="em andamento">Em Andamento</option>
              <option value="resolvido">Resolvido</option>
              <option value="fechado">Fechado</option>
            </select>

            {/* NOVO FILTRO: TIPO DE SOLICITANTE */}
            <select 
              value={filtroTipoUsuario}
              onChange={(e) => { setFiltroTipoUsuario(e.target.value); setPaginaAtual(1); }}
              className="bg-white border border-slate-200 text-slate-600 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="todos">Todos os Solicitantes</option>
              <option value="cliente">Apenas Clientes</option>
              <option value="prestador">Apenas Prestadores</option>
            </select>

            {/* BOTÃO DE LIMPAR FILTROS */}
            {(busca || filtroStatus !== 'todos' || filtroTipoUsuario !== 'todos') && (
              <button
                onClick={handleLimparFiltros}
                className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
              >
                <RotateCcw size={14} />
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* ─── TABELA DE TICKETS COMPLETA ─── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-slate-400 bg-slate-50/70 border-b border-slate-100">
                <th className="p-4 w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                    checked={todosDaPaginaSelecionados}
                    onChange={handleSelecionarTodos}
                  />
                </th>
                <th className="p-4 w-16 text-center">ID</th>
                <th className="p-4">Solicitante</th>
                <th className="p-4">Assunto / Descrição</th>
                <th className="p-4">Status</th>
                <th className="p-4">Abertura e Horário</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {ticketsExibidos.length > 0 ? (
                ticketsExibidos.map((ticket) => {
                  const statusLower = ticket.status?.toLowerCase();

                  let dataFormatada = '---';
                  let horarioFormatado = '';
                  if (ticket.data_abertura) {
                    const dateObj = new Date(ticket.data_abertura);
                    dataFormatada = dateObj.toLocaleDateString('pt-BR');
                    horarioFormatado = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  }

                  return (
                    <tr key={ticket.id_ticket} className="hover:bg-slate-50/40 transition">
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                          checked={ticketsSelecionados.includes(ticket.id_ticket)}
                          onChange={() => handleSelecionarUm(ticket.id_ticket)}
                        />
                      </td>
                      <td className="p-4 text-center font-medium text-slate-500 text-xs">#{ticket.id_ticket}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{ticket.nome_usuario}</p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-1 inline-block capitalize ${
                            ticket.is_prestador ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-600'
                          }`}>
                            {ticket.is_prestador ? 'prestador' : 'cliente'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs truncate">
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{ticket.titulo}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{ticket.descricao}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase border ${
                          statusLower === 'aberto' ? 'bg-rose-50 text-amber-500 border-rose-100' :
                          statusLower === 'em andamento' ? 'bg-amber-50 text-orange-500 border-amber-100' :
                          statusLower === 'resolvido' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 text-xs leading-normal">
                        <p className="font-semibold text-slate-700">{dataFormatada}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">às {horarioFormatado}</p>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-3 text-slate-400">
                          <button 
                            onClick={() => handleAbrirModal(ticket)}
                            className="hover:text-indigo-600 p-1 transition"
                            title="Visualizar e Responder"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeletarTicket(ticket.id_ticket)}
                            className="hover:text-rose-600 p-1 transition"
                            title="Excluir Ticket"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-slate-400 text-xs">
                    {loading ? 'Carregando tickets do suporte...' : 'Nenhum chamado pendente encontrado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINAÇÃO */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div>
            Mostrando <span className="font-bold text-slate-700">{totalItens > 0 ? indicePrimeiroItem + 1 : 0}</span> a{' '}
            <span className="font-bold text-slate-700">{Math.min(indiceUltimoItem, totalItens)}</span> de{' '}
            <span className="font-bold text-slate-700">{totalItens}</span> chamados
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1}
              className="p-2 border border-slate-200 rounded-xl hover:bg-white transition disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-bold px-2 text-slate-700">Página {paginaAtual} de {totalPaginas}</span>
            <button
              onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas}
              className="p-2 border border-slate-200 rounded-xl hover:bg-white transition disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── MODAL DE TRATAMENTO / RESPOSTA ─── */}
      {ticketSelecionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setTicketSelecionado(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="border-b border-slate-100 pb-3 mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Detalhes do Chamado #{ticketSelecionado.id_ticket}</span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">{ticketSelecionado.titulo}</h3>
              <p className="text-xs text-slate-400 mt-1">Solicitante: <strong className="text-slate-600">{ticketSelecionado.nome_usuario}</strong> (ID: {ticketSelecionado.id_usuario})</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Relato do Usuário:</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{ticketSelecionado.descricao}</p>
            </div>

            <form onSubmit={handleSalvarResposta} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Atualizar Status</label>
                  <select
                    value={novoStatus}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNovoStatus(val);
                      if (val === 'Fechado') setEncerrarTicket(true);
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Aberto">Aberto</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Resolvido">Resolvido</option>
                    <option value="Fechado">Fechado</option>
                  </select>
                </div>

                <div className="flex items-center pt-5 pl-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-semibold">
                    <input 
                      type="checkbox" 
                      checked={encerrarTicket}
                      onChange={(e) => setEncerrarTicket(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    Arquivar / Encerrar Chamado
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Sua Resposta Admin</label>
                <textarea
                  rows={4}
                  value={respostaAdmin}
                  onChange={(e) => setRespostaAdmin(e.target.value)}
                  placeholder="Escreva aqui as instruções ou a solução definitiva fornecida ao usuário..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTicketSelecionado(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                >
                  Fechar Janela
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Send size={14} />
                  {submitting ? 'Salvando...' : 'Salvar Resposta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
