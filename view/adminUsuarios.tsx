'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search, Eye, AlertTriangle, UserX, UserCheck, X, ChevronLeft, ChevronRight,
    Users, UserPlus, ShieldCheck, ShieldOff
} from 'lucide-react';
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
    is_admin?: boolean;
}

interface MetricsUsuarios {
    total: number;
    ativos: number;
    novos_mes: number;
    desativados: number;
}

export default function AdminUsuarios() {
    const router = useRouter();

    const [usuarios, setUsuarios] = useState<UsuarioPlataforma[]>([]);
    const [metrics, setMetrics] = useState<MetricsUsuarios>({
        total: 0, ativos: 0, novos_mes: 0, desativados: 0
    });
    const [loading, setLoading] = useState(true);

    const [busca, setBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativos' | 'inativos'>('todos');
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 6;

    const [usuariosSelecionados, setUsuariosSelecionados] = useState<number[]>([]);

    const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioPlataforma | null>(null);
    const [tipoAcao, setTipoAcao] = useState<'desativar' | 'reativar' | 'sinalizar' | 'promoverAdmin' | 'removerAdmin' | null>(null);
    const [motivoAcao, setMotivoAcao] = useState('');
    const [submittingAcao, setSubmittingAcao] = useState(false);

    const estaDesativado = (status: string) => {
        const s = status?.toLowerCase();
        return s === 'inativo' || s === 'inativa' || s === 'desativado' || s === 'desativada';
    };

    const fetchUsuarios = async () => {
        try {
            setLoading(true);

            const resUsuarios = await fetch(`/api/usuario`);
            const dataUsuarios = await resUsuarios.json();
            const listaUsuarios = Array.isArray(dataUsuarios) ? dataUsuarios : [];

            // API paginada; helper percorre as páginas para manter a lista de IDs completa
            const dataPrestadores = await fetchTodosPrestadores();
            const idsPrestadores = Array.isArray(dataPrestadores)
                ? dataPrestadores.map((p: any) => p.id_usuario)
                : [];

            const usuariosComTipo: UsuarioPlataforma[] = listaUsuarios.map((u: any) => ({
                ...u,
                is_prestador: idsPrestadores.includes(u.id_usuario),
            }));

            setUsuarios(usuariosComTipo);

            const total       = usuariosComTipo.length;
            const ativos      = usuariosComTipo.filter(u => !estaDesativado(u.status_conta)).length;
            const desativados = usuariosComTipo.filter(u => estaDesativado(u.status_conta)).length;
            setMetrics({ total, ativos, novos_mes: Math.ceil(total * 0.1), desativados });

        } catch (error) {
            console.error("Erro ao carregar lista de usuários:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsuarios(); }, []);

    const handleVisualizarPerfil = (id_usuario: number) => {
        router.push(`/admin/usuarios/${id_usuario}`);
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

            if (tipoAcao === 'promoverAdmin' || tipoAcao === 'removerAdmin') {
                const response = await fetch(`/api/admin/usuarios/${usuarioSelecionado.id_usuario}/admin`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        acao: tipoAcao === 'promoverAdmin' ? 'promover' : 'remover',
                    }),
                });

                const resData = await response.json().catch(() => ({}));

                if (response.ok) {
                    alert(resData.mensagem || 'Permissão atualizada com sucesso.');
                    setUsuarioSelecionado(null);
                    setTipoAcao(null);
                    setMotivoAcao('');
                    fetchUsuarios();
                    return;
                }

                alert(`Aviso do Servidor: ${resData.erro || resData.error || 'Erro interno na rota do servidor.'}`);
                return;
            }

            const queryParam = tipoAcao === 'desativar' ? 'desativar' : 'reativar';

            const response = await fetch(
                `/api/usuario/${usuarioSelecionado.id_usuario}?admin=${queryParam}`,
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
                fetchUsuarios();
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

    const usuariosFiltrados = usuarios.filter(usuario => {
        const correspondeBusca =
            usuario.nome?.toLowerCase().includes(busca.toLowerCase()) ||
            usuario.email?.toLowerCase().includes(busca.toLowerCase());

        const correspondeTipo =
            filtroTipo === 'todos' ||
            (filtroTipo === 'prestador' && usuario.is_prestador) ||
            (filtroTipo === 'cliente' && !usuario.is_prestador);

        const correspondeStatus =
            filtroStatus === 'todos' ||
            (filtroStatus === 'ativos'   && !estaDesativado(usuario.status_conta)) ||
            (filtroStatus === 'inativos' &&  estaDesativado(usuario.status_conta));

        return correspondeBusca && correspondeTipo && correspondeStatus;
    });

    const totalItens         = usuariosFiltrados.length;
    const totalPaginas       = Math.ceil(totalItens / itensPorPagina) || 1;
    const indiceUltimoItem   = paginaAtual * itensPorPagina;
    const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
    const usuariosExibidos   = usuariosFiltrados.slice(indicePrimeiroItem, indiceUltimoItem);

    const mudarPagina = (numeroPagina: number) => {
        if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
            setPaginaAtual(numeroPagina);
            setUsuariosSelecionados([]);
        }
    };

    const todosDaPaginaSelecionados = usuariosExibidos.length > 0 &&
        usuariosExibidos.every(u => usuariosSelecionados.includes(u.id_usuario));

    const handleSelecionarTodos = () => {
        if (todosDaPaginaSelecionados) {
            const idsDaPagina = usuariosExibidos.map(u => u.id_usuario);
            setUsuariosSelecionados(prev => prev.filter(id => !idsDaPagina.includes(id)));
        } else {
            const novosIds = usuariosExibidos.map(u => u.id_usuario);
            setUsuariosSelecionados(prev => Array.from(new Set([...prev, ...novosIds])));
        }
    };

    const handleSelecionarUm = (id: number) => {
        if (usuariosSelecionados.includes(id)) {
            setUsuariosSelecionados(prev => prev.filter(item => item !== id));
        } else {
            setUsuariosSelecionados(prev => [...prev, id]);
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 font-sans text-slate-800 p-8">

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Usuários</h1>
                <p className="text-sm text-slate-400 mt-0.5">Gerencie todos os usuários cadastrados na plataforma</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Users size={22} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400">Total de usuários</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-0.5">{loading ? '...' : metrics.total.toLocaleString('pt-BR')}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <UserCheck size={22} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400">Usuários ativos</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-0.5">{loading ? '...' : metrics.ativos.toLocaleString('pt-BR')}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                        <UserPlus size={22} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400">Novos este mês</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-0.5">{loading ? '...' : metrics.novos_mes.toLocaleString('pt-BR')}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                        <UserX size={22} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400">Desativados</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-0.5">{loading ? '...' : metrics.desativados.toLocaleString('pt-BR')}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-1 w-full sm:w-auto gap-3 items-center flex-wrap">

                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar usuário..."
                                value={busca}
                                onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                            />
                        </div>

                        <select
                            value={filtroTipo}
                            onChange={(e) => { setFiltroTipo(e.target.value); setPaginaAtual(1); }}
                            className="bg-white border border-slate-200 text-slate-600 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                        >
                            <option value="todos">Todos os tipos</option>
                            <option value="cliente">Cliente</option>
                            <option value="prestador">Prestador</option>
                        </select>

                        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                            {(['todos', 'ativos', 'inativos'] as const).map((opcao) => (
                                <button
                                    key={opcao}
                                    onClick={() => { setFiltroStatus(opcao); setPaginaAtual(1); }}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                                        filtroStatus === opcao
                                            ? opcao === 'ativos'
                                                ? 'bg-emerald-500 text-white shadow-sm'
                                                : opcao === 'inativos'
                                                    ? 'bg-rose-500 text-white shadow-sm'
                                                    : 'bg-white text-slate-700 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {opcao === 'todos' ? 'Todos' : opcao === 'ativos' ? `Ativos (${metrics.ativos})` : `Inativos (${metrics.desativados})`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-bold text-slate-400 bg-slate-50/70 border-b border-slate-100">
                                <th className="p-4 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shadow-none cursor-pointer"
                                        checked={todosDaPaginaSelecionados}
                                        onChange={handleSelecionarTodos}
                                    />
                                </th>
                                <th className="p-4">Usuário</th>
                                <th className="p-4">ID</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Permissão</th>
                                <th className="p-4">Email</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100">
                            {usuariosExibidos.length > 0 ? (
                                usuariosExibidos.map((usuario) => {
                                    const isDesativado = estaDesativado(usuario.status_conta);

                                    return (
                                        <tr
                                            key={usuario.id_usuario}
                                            className={`transition ${
                                                isDesativado
                                                    ? 'bg-slate-100/70 opacity-60 hover:opacity-80'
                                                    : 'hover:bg-slate-50/40'
                                            }`}
                                        >
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shadow-none cursor-pointer"
                                                    checked={usuariosSelecionados.includes(usuario.id_usuario)}
                                                    onChange={() => handleSelecionarUm(usuario.id_usuario)}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-slate-200 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-slate-600 uppercase text-xs">
                                                        {usuario.nome?.slice(0, 2) || 'US'}
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold leading-tight ${isDesativado ? 'text-slate-400' : 'text-slate-800'}`}>
                                                            {usuario.nome}
                                                        </p>
                                                        <p className="text-xs text-slate-400">{usuario.telefone || '(00) 00000-0000'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs font-medium text-slate-500">{usuario.id_usuario}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase ${
                                                    isDesativado
                                                        ? 'bg-rose-50 text-rose-500 border border-rose-100'
                                                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                }`}>
                                                    {usuario.status_conta || 'ativo'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-md capitalize ${
                                                    usuario.is_prestador ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-600'
                                                }`}>
                                                    {usuario.is_prestador ? 'prestador' : 'cliente'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                                                    usuario.is_admin ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {usuario.is_admin ? 'admin' : 'usuário'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-600 text-xs">{usuario.email}</td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center gap-2 text-slate-400">
                                                    <button
                                                        onClick={() => handleVisualizarPerfil(usuario.id_usuario)}
                                                        className="hover:text-indigo-600 p-1 transition"
                                                        title="Visualizar Perfil"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setUsuarioSelecionado(usuario); setTipoAcao('sinalizar'); }}
                                                        className="hover:text-amber-500 p-1 transition"
                                                        title="Enviar Advertência"
                                                    >
                                                        <AlertTriangle size={16} />
                                                    </button>

                                                    {isDesativado ? (
                                                        <button
                                                            onClick={() => { setUsuarioSelecionado(usuario); setTipoAcao('reativar'); }}
                                                            className="hover:text-emerald-500 p-1 transition"
                                                            title="Reativar Conta"
                                                        >
                                                            <UserCheck size={16} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setUsuarioSelecionado(usuario); setTipoAcao('desativar'); }}
                                                            className="hover:text-rose-500 p-1 transition"
                                                            title="Desativar Conta"
                                                        >
                                                            <UserX size={16} />
                                                        </button>
                                                    )}
                                                    {usuario.is_admin ? (
                                                        <button
                                                            onClick={() => { setUsuarioSelecionado(usuario); setTipoAcao('removerAdmin'); }}
                                                            className="hover:text-sky-700 p-1 transition"
                                                            title="Remover administrador"
                                                        >
                                                            <ShieldOff size={16} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setUsuarioSelecionado(usuario); setTipoAcao('promoverAdmin'); }}
                                                            className="hover:text-sky-600 p-1 transition"
                                                            title="Tornar administrador"
                                                        >
                                                            <ShieldCheck size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center p-8 text-slate-400 text-xs">
                                        {loading ? "Carregando usuários..." : "Nenhum usuário encontrado."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
                    <div>
                        Mostrando <span className="font-bold text-slate-700">{totalItens > 0 ? indicePrimeiroItem + 1 : 0}</span> a{' '}
                        <span className="font-bold text-slate-700">{Math.min(indiceUltimoItem, totalItens)}</span> de{' '}
                        <span className="font-bold text-slate-700">{totalItens}</span> usuários
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => mudarPagina(paginaAtual - 1)}
                            disabled={paginaAtual === 1}
                            className="p-2 border border-slate-200 rounded-xl hover:bg-white transition disabled:opacity-40"
                        >
                            <ChevronLeft size={14} />
                        </button>

                        {Array.from({ length: totalPaginas }, (_, index) => {
                            const pagina = index + 1;
                            if (pagina === 1 || pagina === totalPaginas || Math.abs(pagina - paginaAtual) <= 1) {
                                return (
                                    <button
                                        key={pagina}
                                        onClick={() => mudarPagina(pagina)}
                                        className={`px-3 py-1.5 font-bold rounded-xl border transition ${
                                            paginaAtual === pagina
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                                        }`}
                                    >
                                        {pagina}
                                    </button>
                                );
                            } else if (pagina === 2 || pagina === totalPaginas - 1) {
                                return <span key={pagina} className="px-1 text-slate-400">...</span>;
                            }
                            return null;
                        })}

                        <button
                            onClick={() => mudarPagina(paginaAtual + 1)}
                            disabled={paginaAtual === totalPaginas}
                            className="p-2 border border-slate-200 rounded-xl hover:bg-white transition disabled:opacity-40"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {usuarioSelecionado && tipoAcao && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-xl p-6 relative">
                        <button
                            onClick={() => { setUsuarioSelecionado(null); setTipoAcao(null); setMotivoAcao(''); }}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                        >
                            <X size={18} />
                        </button>

                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            {tipoAcao === 'desativar' && <><UserX className="text-rose-600" size={20} /> Desativar Usuário</>}
                            {tipoAcao === 'reativar'  && <><UserCheck className="text-emerald-600" size={20} /> Reativar Usuário</>}
                            {tipoAcao === 'sinalizar' && <><AlertTriangle className="text-amber-500" size={20} /> Enviar Advertência</>}
                            {tipoAcao === 'promoverAdmin' && <><ShieldCheck className="text-sky-600" size={20} /> Tornar administrador</>}
                            {tipoAcao === 'removerAdmin' && <><ShieldOff className="text-sky-700" size={20} /> Remover administrador</>}
                        </h3>

                        <p className="text-sm text-slate-400 mt-1">
                            {tipoAcao === 'sinalizar'
                                ? <>Uma notificação de advertência será enviada para <strong className="text-slate-700">{usuarioSelecionado.nome}</strong>.</>
                                : tipoAcao === 'promoverAdmin'
                                    ? <>Você dará permissão administrativa para <strong className="text-slate-700">{usuarioSelecionado.nome}</strong>.</>
                                    : tipoAcao === 'removerAdmin'
                                        ? <>Você removerá a permissão administrativa de <strong className="text-slate-700">{usuarioSelecionado.nome}</strong>. A ação será bloqueada se for o último admin ativo.</>
                                        : <>Você aplicará uma alteração na conta de <strong className="text-slate-700">{usuarioSelecionado.nome}</strong> (ID: {usuarioSelecionado.id_usuario}).</>
                            }
                        </p>

                        <form onSubmit={handleConfirmarAcao} className="mt-4 space-y-4">
                            {tipoAcao !== 'promoverAdmin' && tipoAcao !== 'removerAdmin' && (
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
                            )}

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
                                                : tipoAcao === 'sinalizar'
                                                    ? 'bg-amber-500 hover:bg-amber-600'
                                                    : 'bg-sky-600 hover:bg-sky-700'
                                    }`}
                                >
                                    {submittingAcao
                                        ? 'Salvando...'
                                        : tipoAcao === 'desativar' ? 'Confirmar Desativação'
                                        : tipoAcao === 'reativar'  ? 'Confirmar Reativação'
                                        : tipoAcao === 'sinalizar' ? 'Enviar Advertência'
                                        : tipoAcao === 'promoverAdmin' ? 'Tornar administrador'
                                        : 'Remover administrador'
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
