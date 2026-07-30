'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, AlertTriangle, UserX, X, Star, CheckCircle, UserCheck } from 'lucide-react';
import { fetchTodosPrestadores } from '@/app/lib/fetchTodosPrestadores';

interface UsuarioPlataforma {
  id_usuario: number;
  nome: string;
  email: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  data_cadastro?: string;
  status_conta: string;
  is_prestador: boolean;
  categoria?: string;
  avaliacao?: number;
  avaliacoes_count?: number;
  servicos_realizados?: number;
}

interface MetricsPrestadores {
  total: number;
  ativos: number;
  novos_mes: number;
  bloqueados: number;
}

export default function AdminPrestadores() {
  const id_solicitante = 1;
  const router = useRouter();

  const [prestadores, setPrestadores] = useState<UsuarioPlataforma[]>([]);
  const [metrics, setMetrics] = useState<MetricsPrestadores>({
    total: 0, ativos: 0, novos_mes: 0, bloqueados: 0
  });
  const [loading, setLoading] = useState(true);
  const [selecionados, setSelecionados] = useState<number[]>([]);

  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroCidade, setFiltroCidade] = useState('todos');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioPlataforma | null>(null);
  const [tipoAcao, setTipoAcao] = useState<'desativar' | 'sinalizar' | 'reativar' | null>(null);
  const [motivoAcao, setMotivoAcao] = useState('');
  const [submittingAcao, setSubmittingAcao] = useState(false);

  const fetchPrestadores = async () => {
    try {
      setLoading(true);

      // 1. Busca todos os prestadores (já vem com nome, email, cidade, status_conta via JOIN)
      // A API é paginada; o helper busca todas as páginas sem sobrecarregar o banco em uma única consulta.
      const listaPrestadores = await fetchTodosPrestadores();

      const prestadoresFormatados: UsuarioPlataforma[] = listaPrestadores.map((p: any) => ({
        id_usuario: p.id_usuario,
        nome: p.nome,
        email: p.email,
        telefone: p.telefone,
        cidade: p.cidade,
        status_conta: p.status_conta,
        is_prestador: true,
        categoria: p.categoria_principal,
        avaliacao: p.media_nota ?? 0,
        avaliacoes_count: p.total_avaliacoes ?? 0,
        servicos_realizados: p.servicos_realizados ?? 0,
        data_cadastro: p.data_criacao,
      }));

      setPrestadores(prestadoresFormatados);

      const total = prestadoresFormatados.length;
      const ativos = prestadoresFormatados.filter(u => u.status_conta?.toLowerCase() === 'ativo').length;
      const bloqueados = prestadoresFormatados.filter(u =>
        ['bloqueado', 'inativo', 'inativa', 'desativado', 'desativada'].includes(u.status_conta?.toLowerCase())
      ).length;

      const novos = prestadoresFormatados.filter(u => {
        if (!u.data_cadastro) return false;
        const dataCadastro = new Date(u.data_cadastro);
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
        return dataCadastro >= trintaDiasAtras;
      }).length;

      setMetrics({
        total,
        ativos,
        novos_mes: novos,
        bloqueados
      });
    } catch (error) {
      console.error("Erro ao carregar lista de prestadores do banco:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrestadores();
  }, []);

  const handleReativar = async (usuario: UsuarioPlataforma) => {
    if (!confirm(`Deseja reativar a conta de ${usuario.nome}?`)) return;

    try {
      const response = await fetch(
        `/api/usuario/${usuario.id_usuario}?admin=reativar&id_solicitante=${id_solicitante}`,
        { method: 'PATCH' }
      );

      if (response.ok) {
        alert(`Conta de ${usuario.nome} reativada com sucesso!`);
        fetchPrestadores();
      } else {
        const errData = await response.json();
        alert(`Falha ao reativar: ${errData.erro || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      alert('Erro de conexão ao tentar reativar a conta.');
    }
  };

  const handleConfirmarAcao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioSelecionado || !tipoAcao) return;

    try {
      setSubmittingAcao(true);

      if (tipoAcao === 'sinalizar') {
        const titulo    = 'Advertência Administrativa';
        const descricao = motivoAcao.trim()
          ? motivoAcao.trim()
          : 'Sua conta recebeu uma advertência do administrador da plataforma.';

        const resNotif = await fetch('/api/notificacao', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_usuario: usuarioSelecionado.id_usuario,
            titulo,
            descricao,
          }),
        });

        const notifData = await resNotif.json().catch(() => ({}));

        if (!resNotif.ok) {
          alert(`Erro ao criar notificação: ${notifData.erro || notifData.error || 'Erro interno.'}`);
          return;
        }

        const resAlerta = await fetch('/api/alerta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_notificacao: notifData.id_notificacao,
            prioridade:     3,
            categoria:      'advertencia',
          }),
        });

        if (!resAlerta.ok) {
          const alertaData = await resAlerta.json().catch(() => ({}));
          alert(`Erro ao criar alerta: ${alertaData.erro || alertaData.error || 'Erro interno.'}`);
          return;
        }

        alert(`Advertência enviada com sucesso para ${usuarioSelecionado.nome}!`);
        setUsuarioSelecionado(null);
        setTipoAcao(null);
        setMotivoAcao('');
        return;
      }

      const queryParam = tipoAcao === 'desativar' ? 'desativar' : 'reativar';

      const response = await fetch(
        `/api/usuario/${usuarioSelecionado.id_usuario}?admin=${queryParam}&id_solicitante=${id_solicitante}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(motivoAcao.trim() ? { motivo: motivoAcao.trim() } : {}),
        }
      );

      const resData = await response.json().catch(() => ({}));

      if (response.ok) {
        const label = tipoAcao === 'desativar' ? 'desativado' : 'reativado';
        alert(`Operação realizada com sucesso: Usuário ${label}!`);
        setUsuarioSelecionado(null);
        setTipoAcao(null);
        setMotivoAcao('');
        fetchPrestadores();
      } else {
        alert(`Aviso do Servidor: ${resData.erro || resData.error || 'Erro interno na rota do servidor.'}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro de conexão ao tentar salvar as alterações.");
    } finally {
      setSubmittingAcao(false);
    }
  };

  const prestadoresFiltrados = prestadores.filter(p => {
    const correspondeBusca =
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.id_usuario.toString().includes(busca);

    const correspondeCategoria =
      filtroCategoria === 'todos' ||
      p.categoria?.toLowerCase() === filtroCategoria.toLowerCase();

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
    <div className="w-full min-h-screen bg-white font-sans text-slate-800 p-4 sm:p-6 lg:p-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Prestadores</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Total de prestadores</p>
            <h3 className="text-3xl font-bold text-black mt-0.5">{loading ? '...' : metrics.total.toLocaleString('pt-BR')}</h3>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Prestadores ativos</p>
            <h3 className="text-3xl font-bold text-black mt-0.5">{loading ? '...' : metrics.ativos.toLocaleString('pt-BR')}</h3>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Novos este mês</p>
            <h3 className="text-3xl font-bold text-black mt-0.5">{loading ? '...' : metrics.novos_mes.toLocaleString('pt-BR')}</h3>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Bloqueados</p>
            <h3 className="text-3xl font-bold text-black mt-0.5">{loading ? '...' : metrics.bloqueados.toLocaleString('pt-BR')}</h3>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 shadow-sm">

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
              aria-label="Filtrar prestadores por categoria"
              value={filtroCategoria}
              onChange={(e) => { setFiltroCategoria(e.target.value); setPaginaAtual(1); }}
              className="w-full bg-white border border-slate-200 text-slate-600 text-sm rounded-2xl px-3 py-2.5 focus:outline-none"
            >
              <option value="todos">Todas</option>
              {Array.from(new Set(prestadores.map(p => p.categoria).filter(Boolean))).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col w-full max-w-xs">
            <span className="text-xs font-semibold text-slate-500 mb-1 ml-1">Cidade</span>
            <select
              aria-label="Filtrar prestadores por cidade"
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

        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-slate-400 bg-slate-50 border-b border-slate-100">
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    aria-label="Selecionar todos os prestadores da página"
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
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {prestadoresExibidos.length > 0 ? (
                prestadoresExibidos.map((usuario) => {
                  const estaSelecionado = selecionados.includes(usuario.id_usuario);
                  const estaBloqueado = ['bloqueado', 'inativo', 'inativa', 'desativado', 'desativada'].includes(
                    usuario.status_conta?.toLowerCase()
                  );

                  return (
                    <tr
                      key={usuario.id_usuario}
                      className={`transition ${estaSelecionado ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-slate-50/40'}`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Selecionar prestador ${usuario.nome}`}
                          className="rounded cursor-pointer"
                          checked={estaSelecionado}
                          onChange={() => handleToggleSelecionarItem(usuario.id_usuario)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-200 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-slate-600 uppercase text-xs">
                            {usuario.nome.slice(0, 2)}
                          </div>
                          <span className="font-medium text-slate-800">{usuario.nome}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500">{usuario.id_usuario}</td>
                      <td className="p-4 text-slate-600 capitalize">{usuario.categoria || 'Não informada'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Star size={14} className="fill-blue-500 text-blue-500" />
                          <span>
                            {usuario.avaliacao ? Number(usuario.avaliacao).toFixed(1) : "0.0"}{' '}
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
                            {usuario.status_conta}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-3 text-slate-400">
                          <button
                            onClick={() => router.push(`/perfil/prestador/${usuario.id_usuario}`)}
                            className="hover:text-indigo-600 transition"
                            title="Visualizar Perfil"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => { setUsuarioSelecionado(usuario); setTipoAcao('sinalizar'); }}
                            className="hover:text-amber-500 transition"
                            title="Sinalizar Advertência"
                          >
                            <AlertTriangle size={18} />
                          </button>

                          {estaBloqueado ? (
                            <button
                              onClick={() => handleReativar(usuario)}
                              className="hover:text-emerald-500 transition"
                              title="Reativar Conta"
                            >
                              <CheckCircle size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => { setUsuarioSelecionado(usuario); setTipoAcao('desativar'); }}
                              className="hover:text-rose-500 transition"
                              title="Desativar Conta"
                            >
                              <UserX size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center p-8 text-slate-400 text-xs">
                    {loading ? "Carregando prestadores..." : "Nenhum prestador encontrado no banco de dados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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

      {usuarioSelecionado && tipoAcao && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-xl p-6 relative">
            <button
              onClick={() => { setUsuarioSelecionado(null); setTipoAcao(null); setMotivoAcao(''); }}
              aria-label="Fechar modal de ação do prestador"
              title="Fechar"
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {tipoAcao === 'desativar' && <><UserX className="text-rose-600" size={20} /> Desativar Usuário</>}
              {tipoAcao === 'reativar'  && <><UserCheck className="text-emerald-600" size={20} /> Reativar Usuário</>}
              {tipoAcao === 'sinalizar' && <><AlertTriangle className="text-amber-500" size={20} /> Enviar Advertência</>}
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              {tipoAcao === 'sinalizar'
                ? <>Uma notificação de advertência será enviada para <strong className="text-slate-700">{usuarioSelecionado.nome}</strong>.</>
                : <>Você aplicará uma alteração na conta de <strong className="text-slate-700">{usuarioSelecionado.nome}</strong> (ID: {usuarioSelecionado.id_usuario}).</>
              }
            </p>

            <form onSubmit={handleConfirmarAcao} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                  {tipoAcao === 'sinalizar' ? 'Mensagem da advertência' : 'Motivo / Justificativa'}{' '}
                  <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                </label>
                <textarea
                  rows={3}
                  value={motivoAcao}
                  onChange={(e) => setMotivoAcao(e.target.value)}
                  placeholder={
                    tipoAcao === 'sinalizar'
                      ? 'Descreva o motivo da advertência (opcional)...'
                      : 'Descreva a justificativa para essa alteração (opcional)...'
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setUsuarioSelecionado(null); setTipoAcao(null); setMotivoAcao(''); }}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingAcao}
                  className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 ${
                    tipoAcao === 'desativar'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : tipoAcao === 'reativar'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  {submittingAcao
                    ? 'Salvando...'
                    : tipoAcao === 'desativar' ? 'Confirmar Desativação'
                    : tipoAcao === 'reativar'  ? 'Confirmar Reativação'
                    : 'Enviar Advertência'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
