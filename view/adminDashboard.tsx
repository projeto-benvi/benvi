'use client';

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, Wrench, ShieldAlert,
    Ticket, AlertTriangle, Handshake, Settings, LogOut,
    Send, Eye, MoreVertical
} from 'lucide-react';
import { fetchTodosPrestadores } from '@/app/lib/fetchTodosPrestadores';

// --- Interfaces de Tipagem das APIs ---
interface DashboardData {
    usuarios: { total: number; prestadores: number; usuarios_comuns: number; };
    plataforma: { total_solicitacoes: number; total_agendas: number; total_assinaturas_ativas: number; };
    suporte: { total_tickets: number; tickets_pendentes: number; disponivel: boolean; };
}

interface RecentUser {
    id_usuario: number;
    nome: string;
    email: string;
    status_conta: string;
    is_prestador: boolean;
}

interface TicketSuporte {
    id_ticket: number;
    id_usuario: number;
    titulo: string;
    descricao: string;
    status: string;
    resposta_admin: string | null;
    data_abertura: string;
    data_encerramento: string | null;
}

interface CidadeAtendida {
    id_cidade: number;
    id_parceria: number;
    cidade: string;
    estado: string;
    acesso_gratuito: boolean;
}

export default function AdminDashboard() {
    // Estados dos dados do Backend
    const [metrics, setMetrics] = useState<DashboardData | null>(null);
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [tickets, setTickets] = useState<TicketSuporte[]>([]);
    const [cidades, setCidades] = useState<CidadeAtendida[]>([]);
    const [parcerias, setParcerias] = useState<any[]>([]); 
    const [loading, setLoading] = useState(true);

    // Estados da paginação das Parcerias Ativas
    const [currentPartnerPage, setCurrentPartnerPage] = useState(0);
    const itemsPerPage = 4; // Quantidade de parcerias exibidas por vez

    // Estados do formulário de Alerta
    const [alertaTitulo, setAlertaTitulo] = useState('');
    const [alertaMensagem, setAlertaMensagem] = useState('');
    const [alertaTipo, setAlertaTipo] = useState('informativo');
    const [alertaPublico, setAlertaPublico] = useState('todos');
    const [urlAcao, setUrlAcao] = useState('');
    const [destinatariosEstimados, setDestinatariosEstimados] = useState<number | null>(null);
    const [enviandoAlerta, setEnviandoAlerta] = useState(false);
    const [feedbackAlerta, setFeedbackAlerta] = useState('');

    // Carregamento inicial de dados integrados   
    useEffect(() => {
        async function loadDashboardData() {
            try {
                setLoading(true);

                // Busca usuários e prestadores para calcular as métricas no front
                const resUsuarios = await fetch(`/api/usuario`);
                const dataUsuarios = await resUsuarios.json();
                const listaUsuarios = Array.isArray(dataUsuarios) ? dataUsuarios : [];

                // API paginada; helper percorre as páginas para manter o total correto
                const listaPrestadores = await fetchTodosPrestadores();

                const totalUsuarios = listaUsuarios.length;
                const totalPrestadores = listaPrestadores.length;

                // Tickets
                const resTickets = await fetch(`/api/ticketSuporte`);
                const dataTickets = await resTickets.json();
                const listaTickets = Array.isArray(dataTickets) ? dataTickets : [];

                setMetrics({
                    usuarios: {
                        total: totalUsuarios,
                        prestadores: totalPrestadores,
                        usuarios_comuns: totalUsuarios - totalPrestadores,
                    },
                    plataforma: {
                        total_solicitacoes: 0,
                        total_agendas: 0,
                        total_assinaturas_ativas: 0,
                    },
                    suporte: {
                        total_tickets: listaTickets.length,
                        tickets_pendentes: listaTickets.filter(
                            (t: any) => t?.status?.toLowerCase() === 'aberto' || t?.status?.toLowerCase() === 'pendente'
                        ).length,
                        disponivel: true,
                    },
                });

                setRecentUsers(
                    listaUsuarios.slice(0, 5).map((u: any) => ({
                        id_usuario: u.id_usuario,
                        nome: u.nome,
                        email: u.email,
                        status_conta: u.status_conta,
                        is_prestador: listaPrestadores.some((p: any) => p.id_usuario === u.id_usuario),
                    }))
                );

                setTickets(listaTickets.slice(0, 6));

                // Cidades Atendidas Reais via cidadeAtendidaController
                const resCidades = await fetch(`/api/cidadeAtendida`);
                const dataCidades = await resCidades.json();
                setCidades(Array.isArray(dataCidades) ? dataCidades : []);

                // Parcerias do sistema
                const resParcerias = await fetch(`/api/parceria`);
                const dataParcerias = await resParcerias.json();
                setParcerias(Array.isArray(dataParcerias) ? dataParcerias : []);

            } catch (error) {
                console.error("Erro ao integrar componentes do painel:", error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    const estimarDestinatariosAlerta = async () => {
        const response = await fetch(`/api/admin/alertas?publicoAlvo=${alertaPublico}`, { cache: 'no-store' });
        const dados = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(dados.erro || 'Erro ao estimar destinatários.');
        setDestinatariosEstimados(Number(dados.total_destinatarios || 0));
        return Number(dados.total_destinatarios || 0);
    };

    useEffect(() => {
        setDestinatariosEstimados(null);
        setFeedbackAlerta('');
    }, [alertaPublico]);

    // Envio do formulário de Alerta
    const handleSendAlert = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedbackAlerta('');

        try {
            setEnviandoAlerta(true);
            const total = destinatariosEstimados ?? await estimarDestinatariosAlerta();

            if (!confirm(`Enviar este alerta para ${total} destinatário(s)?`)) {
                setEnviandoAlerta(false);
                return;
            }

            const response = await fetch(`/api/admin/alertas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titulo: alertaTitulo,
                    mensagem: alertaMensagem,
                    tipo: alertaTipo,
                    publicoAlvo: alertaPublico,
                    urlAcao: urlAcao || null
                })
            });

            if (response.ok) {
                const dados = await response.json().catch(() => ({}));
                setFeedbackAlerta(`Alerta enviado para ${dados.total_destinatarios || total} destinatário(s).`);
                setAlertaTitulo('');
                setAlertaMensagem('');
                setAlertaTipo('informativo');
                setAlertaPublico('todos');
                setUrlAcao('');
                setDestinatariosEstimados(null);
            } else {
                const errData = await response.json();
                setFeedbackAlerta(errData.erro || 'Erro ao enviar alerta.');
            }
        } catch (error) {
            setFeedbackAlerta(error instanceof Error ? error.message : 'Erro ao enviar alerta.');
        } finally {
            setEnviandoAlerta(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-indigo-600 font-medium">
                A carregar ecossistema integrado Benvi...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">

            {/* ─── CONTEÚDO PRINCIPAL ─── */}
            <main className="flex-1 p-8 overflow-y-auto">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>

                {/* ─── CARDS DE MÉTRICAS SUPERIORES ─── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Users size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Usuários ativos</p>
                            <h3 className="text-3xl font-bold text-slate-900">
                                {metrics?.usuarios.total.toLocaleString('pt-BR') || '0'}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Wrench size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Prestadores ativos</p>
                            <h3 className="text-3xl font-bold text-slate-900">
                                {metrics?.usuarios.prestadores.toLocaleString('pt-BR') || '0'}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                            <Ticket size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Tickets abertos</p>
                            <h3 className="text-3xl font-bold text-slate-900">
                                {metrics?.suporte?.tickets_pendentes !== undefined
                                    ? metrics.suporte.tickets_pendentes.toLocaleString('pt-BR')
                                    : Array.isArray(tickets)
                                        ? tickets.filter(t => t?.status?.toLowerCase() === 'aberto').length.toLocaleString('pt-BR')
                                        : '0'}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* ─── SEÇÃO CENTRAL (TABELAS DE USUÁRIOS E TICKETS REAIS) ─── */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

                    {/* Tabela: Usuários Recentes */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Usuários recentes</h2>
                            <a href="/admin/dashboard/usuarios" className="text-sm font-semibold text-indigo-600 hover:underline">Ver todos</a>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs font-bold text-slate-400 bg-slate-50">
                                        <th className="p-3">Usuário</th>
                                        <th className="p-3">Tipo</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-100">
                                    {recentUsers.map((user) => (
                                        <tr key={user.id_usuario} className="hover:bg-slate-50/50 transition">
                                            <td className="p-3 flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-200" />
                                                <div className="truncate .max-w-[140px]">
                                                    <p className="font-semibold text-slate-800 truncate">{user.nome}</p>
                                                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-100 text-indigo-600">
                                                    {user.is_prestador ? 'prestador' : 'comum'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-600">
                                                    {user.status_conta}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center gap-1 text-slate-400">
                                                    <button className="hover:text-indigo-600 p-1"><Eye size={16} /></button>
                                                    <button className="hover:text-slate-600 p-1"><MoreVertical size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tabela: Tickets Recentes Reais */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Tickets Recentes</h2>
                            <a href="/admin/dashboard/tickets" className="text-sm font-semibold text-indigo-600 hover:underline">Ver todos</a>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs font-bold text-slate-400 bg-slate-50">
                                        <th className="p-3">Usuário</th>
                                        <th className="p-3">Descrição</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Aberto em</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-100">
                                    {tickets.length > 0 ? tickets.map((ticket) => (
                                        <tr key={ticket.id_ticket} className="hover:bg-slate-50/50 transition">
                                            <td className="p-3 font-semibold text-slate-800 .max-w-[120px] truncate">
                                                {recentUsers.find(u => u.id_usuario === ticket.id_usuario)?.nome || `ID ${ticket.id_usuario}`}
                                            </td>
                                            <td className="p-3 text-slate-500 .max-w-[180px] truncate">
                                                {ticket.descricao}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${ticket.status.toLowerCase() === 'aberto' || ticket.status.toLowerCase() === 'pendente'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-slate-400 text-xs">
                                                {ticket.data_abertura ? new Date(ticket.data_abertura).toLocaleDateString('pt-BR') : '-'}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="text-center p-8 text-slate-400">
                                                Nenhum ticket registado no momento.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ─── SEÇÃO INFERIOR (FORMULÁRIO DE ALERTA & PARCERIAS DINÂMICAS PAGINADAS) ─── */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                    {/* Formulário: Criar Alerta */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Enviar alerta rápido</h2>
                        <form onSubmit={handleSendAlert} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Título</label>
                                    <input
                                        type="text"
                                        value={alertaTitulo}
                                        onChange={(e) => setAlertaTitulo(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Ex: Manutenção programada"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipo/gravidade</label>
                                    <select
                                        value={alertaTipo}
                                        onChange={(e) => setAlertaTipo(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600"
                                    >
                                        <option value="informativo">Informativo</option>
                                        <option value="aviso">Aviso</option>
                                        <option value="importante">Importante</option>
                                        <option value="urgente">Urgente</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mensagem</label>
                                <textarea
                                    value={alertaMensagem}
                                    onChange={(e) => setAlertaMensagem(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    rows={4}
                                    placeholder="Escreva uma mensagem curta e objetiva."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Público-alvo</label>
                                    <select
                                        value={alertaPublico}
                                        onChange={(e) => setAlertaPublico(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600"
                                    >
                                        <option value="todos">Todos os usuários ativos</option>
                                        <option value="clientes">Somente clientes ativos</option>
                                        <option value="prestadores">Somente prestadores ativos</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Link interno opcional</label>
                                    <input
                                        type="text"
                                        value={urlAcao}
                                        onChange={(e) => setUrlAcao(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="/notificacoes"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={() => estimarDestinatariosAlerta().catch((error) => setFeedbackAlerta(error.message))}
                                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm px-4 py-2.5 rounded-xl transition"
                                    >
                                        {destinatariosEstimados === null ? 'Estimar destinatários' : `${destinatariosEstimados} destinatário(s)`}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <p className={`text-xs font-bold ${feedbackAlerta.startsWith('Alerta enviado') ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {feedbackAlerta}
                                </p>
                                <button
                                    type="submit"
                                    disabled={enviandoAlerta}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-md shadow-indigo-100 disabled:opacity-50"
                                >
                                    <Send size={16} /> {enviandoAlerta ? 'Enviando...' : 'Enviar alerta'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Carrossel de Parcerias Ativas com Paginação por Bolinhas Funcional */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-slate-900">Parcerias ativas</h2>
                                <a href="/admin/dashboard/parcerias" className="text-sm font-semibold text-indigo-600 hover:underline">Ver todos</a>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {parcerias.length > 0 ? (
                                    parcerias
                                        .slice(currentPartnerPage * itemsPerPage, (currentPartnerPage + 1) * itemsPerPage)
                                        .map((item) => (
                                            <div key={item.id_cidade || item.id_parceria} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center text-center justify-between .min-h-[140px]">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-xs text-indigo-600 font-bold">
                                                    🏛️
                                                </div>
                                                <div className="my-2">
                                                    <p className="text-[11px] font-bold text-slate-800 leading-tight truncate .max-w-[100px]">
                                                        Prefeitura de {item.cidade}
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 uppercase">
                                                        {item.cidade} - {item.estado}
                                                    </p>
                                                </div>
                                                <span className={`text-[9px] font-bold px-3 py-0.5 rounded-full ${item.acesso_gratuito ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {item.acesso_gratuito ? 'Gratuito' : 'Convênio'}
                                                </span>
                                            </div>
                                        ))
                                ) : (
                                    <div className="col-span-4 text-center py-8 text-slate-400 text-sm">
                                        Nenhuma parceria registrada.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Paginação Dinâmica via Bolinhas */}
                        {parcerias.length > itemsPerPage && (
                            <div className="flex justify-center gap-1.5 mt-4">
                                {Array.from({ length: Math.ceil(parcerias.length / itemsPerPage) }).map((_, index) => (
                                    <button
                                        key={`dot-partner-${index}`}
                                        onClick={() => setCurrentPartnerPage(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            currentPartnerPage === index ? 'bg-indigo-600 w-4' : 'bg-slate-200'
                                        }`}
                                        aria-label={`Ir para página ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
