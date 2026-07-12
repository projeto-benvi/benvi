'use client';

import React, { useState, useEffect } from 'react';
import { Search, Star, HeartHandshake, ShieldAlert } from 'lucide-react';
import { fetchTodosPrestadores } from '@/app/lib/fetchTodosPrestadores';

// --- Interfaces de Tipagem Ajustadas para o Banco ---
interface UsuarioPlataforma {
  id_usuario: number;
  nome: string;
  email: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  data_cadastro?: string;
  status_conta: string; // 'ativo', 'bloqueado', 'sinalizado'
  is_prestador: boolean;
  categoria_principal?: string; 
  avaliacao?: number;
  avaliacoes_count?: number;
  servicos_realizados?: number;
  impulsiona_perfil: boolean;    
  is_vulneravel: boolean;        
}

interface MetricsPrestadores {
  total: number;
  ativos: number;
  novos_mes: number;
  bloqueados: number;
}

export default function PrestadoresPage() {
  const id_solicitante = 1;

  const [prestadores, setPrestadores] = useState<UsuarioPlataforma[]>([]);
  const [, setMetrics] = useState<MetricsPrestadores>({
    total: 0, ativos: 0, novos_mes: 0, bloqueados: 0
  });
  const [loading, setLoading] = useState(true);
  const [selecionados, setSelecionados] = useState<number[]>([]);

  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroCidade, setFiltroCidade] = useState('todos');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  const fetchPrestadores = async () => {
    try {
      setLoading(true);
      // Rota que busca a lista geral de prestadores (API paginada; helper percorre as páginas)
      const data = await fetchTodosPrestadores();

      if (Array.isArray(data)) {
        const dadosTratados = data.map((p: any) => ({
          ...p,
          impulsiona_perfil: p.impulsiona_perfil === 1 || p.impulsiona_perfil === true || p.impulsiona_perfil === '1',
          is_vulneravel: p.is_vulneravel === 1 || p.is_vulneravel === true || p.is_vulneravel === '1',
        }));

        setPrestadores(dadosTratados);

        const total = dadosTratados.length;
        const ativos = dadosTratados.filter(u => u.status_conta?.toLowerCase() === 'ativo').length;
        const bloqueados = dadosTratados.filter(u => u.status_conta?.toLowerCase() === 'bloqueado').length;

        const novos = dadosTratados.filter(u => {
          if (!u.data_cadastro) return false;
          const dataCadastro = new Date(u.data_cadastro);
          const trintaDiasAtras = new Date();
          trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
          return dataCadastro >= trintaDiasAtras;
        }).length;

        setMetrics({
          total,
          ativos,
          novos_mes: novos || Math.ceil(total * 0.08),
          bloqueados
        });
      }
    } catch (error) {
      console.error("Erro ao carregar lista de prestadores do banco:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrestadores();
  }, []);

  // --- Altera Estado de Vulnerabilidade Social ---
  const handleToggleVulnerabilidade = async (usuario: UsuarioPlataforma, novoStatus: boolean) => {
    const acaoTexto = novoStatus ? "definir como em vulnerabilidade social" : "remover o status de vulnerabilidade de";
    if (!confirm(`Deseja realmente ${acaoTexto} ${usuario.nome}?`)) return;

    // Atualização Otimista local estável (Garante fluidez na UI)
    setPrestadores(listaAnterior => 
      listaAnterior.map(p => {
        if (p.id_usuario === usuario.id_usuario) {
          return {
            ...p,
            is_vulneravel: novoStatus,
            impulsiona_perfil: novoStatus
          };
        }
        return p;
      })
    );

    try {
      // Enviando requisição estruturada para o endpoint correto do Next.js App Router
      const response = await fetch(`/api/prestador/${usuario.id_usuario}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          is_vulneravel: novoStatus,
          impulsiona_perfil: novoStatus
        })
      });

      if (!response.ok) {
        console.warn("Servidor retornou status de alerta, atualizando dados em background...");
        fetchPrestadores();
      }
    } catch (error) {
      console.error('Erro de comunicação ao atualizar vulnerabilidade:', error);
      // Remove o travamento de alertas em tela e atualiza de forma limpa
      fetchPrestadores(); 
    }
  };

  const prestadoresFiltrados = prestadores.filter(p => {
    const correspondeBusca =
      p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      p.id_usuario?.toString().includes(busca);

    const correspondeCategoria =
      filtroCategoria === 'todos' ||
      p.categoria_principal?.toLowerCase() === filtroCategoria.toLowerCase();

    const correspondeCidade =
      filtroCidade === 'todos' ||
      p.cidade?.toLowerCase() === filtroCidade.toLowerCase();

    return correspondeBusca && correspondeCategoria && correspondeCidade;
  });

  const totalItens = prestadoresFiltrados.length;
  const totalPaginas = Math.ceil(totalItens / itensPorPagina) || 1;
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const prestadoresExibidos = prestadoresFiltrados.slice(indicePrimeiroItem, indiceUltimoItem);

  const mudarPagina = (numeroPagina: number) => {
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
      setPaginaAtual(numeroPagina);
    }
  };

  const todosDaPaginaEstaoSelecionados =
    prestadoresExibidos.length > 0 &&
    prestadoresExibidos.every(p => selecionados.includes(p.id_usuario));

  const handleToggleSelecionarTodos = () => {
    const idsPaginaAtual = prestadoresExibidos.map(p => p.id_usuario);
    if (todosDaPaginaEstaoSelecionados) {
      setSelecionados(prev => prev.filter(id => !idsPaginaAtual.includes(id)));
    } else {
      setSelecionados(prev => Array.from(new Set([...prev, ...idsPaginaAtual])));
    }
  };

  const handleToggleSelecionarItem = (id: number) => {
    if (selecionados.includes(id)) {
      setSelecionados(prev => prev.filter(item => item !== id));
    } else {
      setSelecionados(prev => [...prev, id]);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans text-slate-800 p-8">

      {/* ─── CABEÇALHO DA PÁGINA ─── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Vulnerabilidades</h1>
      </div>

      {/* ─── TABELA E FILTROS ─── */}
      <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 shadow-sm">

        {/* FILTROS DE BUSCA */}
        <div className="flex flex-col sm:flex-row justify-start items-center gap-4 mb-6">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Buscar Prestador"
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>

          <div className="flex flex-col w-full max-w-xs">
            <span className="text-xs font-semibold text-slate-500 mb-1 ml-1">Categoria</span>
            <select
              value={filtroCategoria}
              onChange={(e) => { setFiltroCategoria(e.target.value); setPaginaAtual(1); }}
              className="w-full bg-white border border-slate-200 text-slate-600 text-sm rounded-2xl px-3 py-2.5 focus:outline-none"
            >
              <option value="todos">Todas</option>
              <option value="prediero">Prediero</option>
              <option value="eletrica">Elétrica</option>
            </select>
          </div>

          <div className="flex flex-col w-full max-w-xs">
            <span className="text-xs font-semibold text-slate-500 mb-1 ml-1">Cidade</span>
            <select
              value={filtroCidade}
              onChange={(e) => { setFiltroCidade(e.target.value); setPaginaAtual(1); }}
              className="w-full bg-white border border-slate-200 text-slate-600 text-sm rounded-2xl px-3 py-2.5 focus:outline-none"
            >
              <option value="todos">Todas</option>
              {Array.from(new Set(prestadores.map(p => p.cidade).filter(Boolean))).map(cidade => (
                <option key={cidade} value={cidade}>{cidade}</option>
              ))}
            </select>
          </div>
        </div>

        {/* LISTAGEM DOS PRESTADORES */}
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-slate-400 bg-slate-50 border-b border-slate-100">
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    className="rounded cursor-pointer"
                    checked={todosDaPaginaEstaoSelecionados}
                    onChange={handleToggleSelecionarTodos}
                  />
                </th>
                <th className="p-4">Prestador</th>
                <th className="p-4">ID</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Avaliação</th>
                <th className="p-4">Serviços</th>
                <th className="p-4">Cidade</th>
                <th className="p-4">Verificação</th>
                <th className="p-4 text-center">Impulsionado</th>
                <th className="p-4 text-center">Vulnerabilidade</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {prestadoresExibidos.length > 0 ? (
                prestadoresExibidos.map((usuario) => {
                  const estaSelecionado = selecionados.includes(usuario.id_usuario);

                  return (
                    <tr
                      key={usuario.id_usuario}
                      className={`transition ${estaSelecionado ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-slate-50/40'}`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          className="rounded cursor-pointer"
                          checked={estaSelecionado}
                          onChange={() => handleToggleSelecionarItem(usuario.id_usuario)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-200 rounded-full .flex-shrink-0 flex items-center justify-center font-bold text-slate-600 uppercase text-xs">
                            {usuario.nome ? usuario.nome.slice(0, 2) : 'PR'}
                          </div>
                          <span className="font-medium text-slate-800">{usuario.nome}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500">{usuario.id_usuario}</td>
                      <td className="p-4 text-slate-600 capitalize">{usuario.categoria_principal || 'Não informada'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Star size={14} className="fill-blue-500 text-blue-500" />
                          <span>
                            {usuario.avaliacao ? usuario.avaliacao.toFixed(1) : "0.0"}{' '}
                            ({usuario.avaliacoes_count || 0})
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{usuario.servicos_realizados || 0}</td>
                      <td className="p-4 text-slate-600">{usuario.cidade || 'Não informada'}</td>
                      <td className="p-4">
                        {usuario.status_conta?.toLowerCase() === 'ativo' ? (
                          <span className="px-3 py-1 text-xs font-semibold rounded-md bg-blue-500 text-white">
                            Verificado
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-semibold rounded-md bg-slate-200 text-slate-600 capitalize">
                            {usuario.status_conta || 'Pendente'}
                          </span>
                        )}
                      </td>
                      
                      {/* COLUNA IMPULSIONADO */}
                      <td className="p-4 text-center">
                        {usuario.impulsiona_perfil ? (
                          <span className="px-4 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                            Sim
                          </span>
                        ) : (
                          <span className="px-4 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                            Não
                          </span>
                        )}
                      </td>

                      {/* COLUNA VULNERABILIDADE SOCIAL */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleVulnerabilidade(usuario, true)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                              usuario.is_vulneravel 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm font-black'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <HeartHandshake size={14} />
                            Sim
                          </button>
                          
                          <button
                            onClick={() => handleToggleVulnerabilidade(usuario, false)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                              !usuario.is_vulneravel
                                ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm font-black'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <ShieldAlert size={14} />
                            Não
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="text-center p-8 text-slate-400 text-xs">
                    {loading ? "Carregando prestadores..." : "Nenhum prestador encontrado no banco de dados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ─── PAGINAÇÃO ─── */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <div>
            Mostrando <span className="font-medium text-slate-700">{totalItens > 0 ? indicePrimeiroItem + 1 : 0} a {Math.min(indiceUltimoItem, totalItens)}</span> de{' '}
            <span className="font-medium text-slate-700">{totalItens.toLocaleString('pt-BR')}</span> prestadores
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => mudarPagina(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-white transition disabled:opacity-40"
            >
              Voltar
            </button>

            {Array.from({ length: totalPaginas }, (_, index) => {
              const pagina = index + 1;
              if (pagina === 1 || pagina === totalPaginas || Math.abs(pagina - paginaAtual) <= 1) {
                return (
                  <button
                    key={pagina}
                    onClick={() => mudarPagina(pagina)}
                    className={`w-8 h-8 font-bold rounded-xl border transition ${paginaAtual === pagina
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                  >
                    {pagina}
                  </button>
                );
              } else if (pagina === 2 || pagina === totalPaginas - 1) {
                return <span key={pagina} className="px-0.5 text-slate-400">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => mudarPagina(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-white transition disabled:opacity-40"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}