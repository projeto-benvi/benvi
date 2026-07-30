'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft, Mail, Phone, MapPin, Calendar, Shield, Ban, Check, AlertTriangle,
    X, Send, Loader2, EyeOff, CheckCircle, Briefcase, TrendingUp
} from 'lucide-react';

interface PrestadorDetalhes {
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
    descricao_profissional?: string;
    status_verificado?: boolean;
    status_social?: string;
    impulsiona_perfil?: boolean;
    categoria_principal?: string;
    is_vulneravel?: boolean;
}

interface Acao {
    id: number;
    tipo: string;
    descricao: string;
    data: string;
}

export default function AdminPerfilPrestador() {
    const router = useRouter();
    const params = useParams();
    const prestadorId = Number(params?.id);

    const [prestador, setPrestador] = useState<PrestadorDetalhes | null>(null);
    const [acoes, setAcoes] = useState<Acao[]>([]);
    const [carregando, setCarregando] = useState(true);

    // Estados para modal de ação
    const [tipoAcao, setTipoAcao] = useState<'desativar' | 'reativar' | 'banir' | 'promoverAdmin' | 'removerAdmin' | 'sinalizar' | null>(null);
    const [motivoAcao, setMotivoAcao] = useState('');
    const [enviandoAcao, setEnviandoAcao] = useState(false);
    const [confirmarBanimento, setConfirmarBanimento] = useState(false);

    const estaDesativado = (status: string) => {
        const s = status?.toLowerCase();
        return s === 'inativo' || s === 'inativa' || s === 'desativado' || s === 'desativada' || s === 'banido';
    };

    useEffect(() => {
        if (!prestadorId || prestadorId === 0) {
            router.push('/admin/prestadores');
            return;
        }

        carregarPrestador();
    }, [prestadorId]);

    const carregarPrestador = async () => {
        try {
            setCarregando(true);
            const response = await fetch(`/api/prestador/${prestadorId}`);

            if (!response.ok) {
                alert('Prestador não encontrado');
                router.push('/admin/prestadores');
                return;
            }

            const data = await response.json();
            const prestadorData = Array.isArray(data) ? data[0] : data;

            setPrestador({
                id_usuario: prestadorData.id_usuario,
                nome: prestadorData.nome,
                email: prestadorData.email,
                telefone: prestadorData.telefone,
                cidade: prestadorData.cidade,
                estado: prestadorData.estado,
                data_cadastro: prestadorData.data_cadastro || prestadorData.data_criacao,
                status_conta: prestadorData.status_conta,
                is_prestador: true,
                is_admin: prestadorData.is_admin || false,
                descricao_profissional: prestadorData.descricao_profissional || 'Sem descrição profissional',
                status_verificado: prestadorData.status_verificado || false,
                status_social: prestadorData.status_social || 'ativo',
                impulsiona_perfil: prestadorData.impulsiona_perfil || false,
                categoria_principal: prestadorData.categoria_principal || 'Não informada',
                is_vulneravel: prestadorData.is_vulneravel || false,
            });

            // Simular histórico de ações (em um caso real, viriam da API)
            setAcoes([
                { id: 1, tipo: 'Cadastro', descricao: 'Conta criada', data: prestadorData.data_cadastro || prestadorData.data_criacao || new Date().toISOString() },
            ]);
        } catch (error) {
            console.error('Erro ao carregar prestador:', error);
            alert('Erro ao carregar perfil do prestador');
        } finally {
            setCarregando(false);
        }
    };

    const executarAcao = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prestador || !tipoAcao) return;

        try {
            setEnviandoAcao(true);

            if (tipoAcao === 'sinalizar') {
                // Criar notificação de advertência
                const resNotif = await fetch('/api/notificacao', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_usuario: prestador.id_usuario,
                        titulo: 'Advertência Administrativa',
                        descricao: motivoAcao.trim() || 'Sua conta recebeu uma advertência do administrador.',
                    }),
                });

                if (!resNotif.ok) {
                    alert('Erro ao enviar advertência');
                    return;
                }

                alert('Advertência enviada com sucesso!');
                setTipoAcao(null);
                setMotivoAcao('');
                return;
            }

            if (tipoAcao === 'promoverAdmin' || tipoAcao === 'removerAdmin') {
                const response = await fetch(`/api/admin/usuarios/${prestador.id_usuario}/admin`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        acao: tipoAcao === 'promoverAdmin' ? 'promover' : 'remover',
                    }),
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    alert(`Erro: ${errData.erro || 'Falha ao atualizar permissões'}`);
                    return;
                }

                alert('Permissões atualizadas com sucesso!');
                setTipoAcao(null);
                setMotivoAcao('');
                await carregarPrestador();
                return;
            }

            if (tipoAcao === 'banir') {
                const response = await fetch(`/api/usuario/${prestador.id_usuario}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status_conta: 'banido',
                        motivo: motivoAcao.trim() || 'Banimento pelo administrador',
                    }),
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    alert(`Erro: ${errData.erro || 'Falha ao banir usuário'}`);
                    return;
                }

                alert('Prestador banido com sucesso!');
                setTipoAcao(null);
                setConfirmarBanimento(false);
                setMotivoAcao('');
                await carregarPrestador();
                return;
            }

            // Ativar/Desativar
            const novoStatus = tipoAcao === 'desativar' ? 'inativo' : 'ativo';
            const response = await fetch(`/api/usuario/${prestador.id_usuario}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status_conta: novoStatus,
                    motivo: motivoAcao.trim() || `Ação de admin: ${tipoAcao}`,
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                alert(`Erro: ${errData.erro || 'Falha ao atualizar status'}`);
                return;
            }

            const label = tipoAcao === 'desativar' ? 'desativado' : 'reativado';
            alert(`Prestador ${label} com sucesso!`);
            setTipoAcao(null);
            setMotivoAcao('');
            await carregarPrestador();
        } catch (error) {
            console.error('Erro ao executar ação:', error);
            alert('Erro ao executar a ação');
        } finally {
            setEnviandoAcao(false);
        }
    };

    if (carregando) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={32} className="text-indigo-600 animate-spin mx-auto mb-2" />
                    <p className="text-slate-500 font-medium">Carregando perfil do prestador...</p>
                </div>
            </div>
        );
    }

    if (!prestador) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-500">Prestador não encontrado</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="max-w-4xl mx-auto px-6 py-6">
                {/* Botão Voltar */}
                <button
                    onClick={() => router.push('/admin/prestadores')}
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-6 transition"
                >
                    <ArrowLeft size={16} />
                    Voltar para prestadores
                </button>

                {/* Header com informações principais */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-6">
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-2xl font-bold text-purple-600">
                                    {prestador.nome.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900">{prestador.nome}</h1>
                                    <p className="text-sm text-slate-500 mt-1">ID: #{prestador.id_usuario}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                    prestador.status_conta === 'ativo'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : prestador.status_conta === 'banido'
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {prestador.status_conta.charAt(0).toUpperCase() + prestador.status_conta.slice(1)}
                                </span>

                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                                    <Briefcase size={12} /> Prestador
                                </span>

                                {prestador.status_verificado && (
                                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                                        <CheckCircle size={12} /> Verificado
                                    </span>
                                )}

                                {prestador.is_admin && (
                                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                                        <Shield size={12} /> Administrador
                                    </span>
                                )}

                                {prestador.is_vulneravel && (
                                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                                        <TrendingUp size={12} /> Vulnerável
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Botões de Ação Rápida */}
                        <div className="flex flex-col gap-2">
                            {prestador.status_conta === 'ativo' ? (
                                <button
                                    onClick={() => setTipoAcao('desativar')}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
                                >
                                    Desativar
                                </button>
                            ) : prestador.status_conta !== 'banido' ? (
                                <button
                                    onClick={() => setTipoAcao('reativar')}
                                    className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl transition"
                                >
                                    Reativar
                                </button>
                            ) : null}

                            {prestador.status_conta !== 'banido' && (
                                <button
                                    onClick={() => setTipoAcao('banir')}
                                    className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 text-sm font-semibold rounded-xl transition"
                                >
                                    Banir
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Grid de Informações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Informações de Contato */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Informações de Contato</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-slate-400" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Email</p>
                                    <p className="text-sm text-slate-700 break-all">{prestador.email}</p>
                                </div>
                            </div>

                            {prestador.telefone && (
                                <div className="flex items-center gap-3">
                                    <Phone size={16} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Telefone</p>
                                        <p className="text-sm text-slate-700">{prestador.telefone}</p>
                                    </div>
                                </div>
                            )}

                            {prestador.cidade && (
                                <div className="flex items-center gap-3">
                                    <MapPin size={16} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Localização</p>
                                        <p className="text-sm text-slate-700">{prestador.cidade}, {prestador.estado}</p>
                                    </div>
                                </div>
                            )}

                            {prestador.data_cadastro && (
                                <div className="flex items-center gap-3">
                                    <Calendar size={16} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Cadastrado em</p>
                                        <p className="text-sm text-slate-700">{new Date(prestador.data_cadastro).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ações Administrativas */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Ações Administrativas</h2>
                        <div className="space-y-2">
                            <button
                                onClick={() => setTipoAcao('sinalizar')}
                                className="w-full flex items-center gap-2 px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-sm rounded-xl transition border border-amber-200"
                            >
                                <AlertTriangle size={16} />
                                Sinalizar / Advertir
                            </button>

                            {!prestador.is_admin ? (
                                <button
                                    onClick={() => setTipoAcao('promoverAdmin')}
                                    className="w-full flex items-center gap-2 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm rounded-xl transition border border-indigo-200"
                                >
                                    <Shield size={16} />
                                    Promover a Admin
                                </button>
                            ) : (
                                <button
                                    onClick={() => setTipoAcao('removerAdmin')}
                                    className="w-full flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition border border-slate-200"
                                >
                                    <EyeOff size={16} />
                                    Remover Privilégios de Admin
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Informações Profissionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Informações Profissionais</h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Categoria Principal</p>
                                <p className="text-sm text-slate-700">{prestador.categoria_principal}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Status Social</p>
                                <p className="text-sm text-slate-700 capitalize">{prestador.status_social}</p>
                            </div>
                            <div className="pt-2 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-600">Perfil Verificado</span>
                                    {prestador.status_verificado ? (
                                        <Check size={18} className="text-emerald-600" />
                                    ) : (
                                        <X size={18} className="text-slate-400" />
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-600">Perfil Impulsionado</span>
                                {prestador.impulsiona_perfil ? (
                                    <Check size={18} className="text-emerald-600" />
                                ) : (
                                    <X size={18} className="text-slate-400" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Descrição Profissional */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Descrição Profissional</h2>
                        <p className="text-slate-600 text-sm leading-relaxed">{prestador.descricao_profissional}</p>
                    </div>
                </div>

                {/* Histórico de Ações */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Histórico de Ações</h2>
                    <div className="space-y-2">
                        {acoes.length === 0 ? (
                            <p className="text-slate-400 text-sm">Nenhuma ação registrada</p>
                        ) : (
                            acoes.map((acao) => (
                                <div key={acao.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-xl">
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{acao.tipo}</p>
                                        <p className="text-slate-500 text-xs mt-0.5">{acao.descricao}</p>
                                    </div>
                                    <p className="text-slate-400 text-xs whitespace-nowrap ml-4">
                                        {new Date(acao.data).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* ─── MODAL DE AÇÃO ─── */}
            {tipoAcao && tipoAcao !== 'banir' && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-xl p-6 relative">
                        <button
                            onClick={() => {
                                setTipoAcao(null);
                                setMotivoAcao('');
                            }}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
                        >
                            <X size={18} />
                        </button>

                        <div className="mb-4">
                            <h3 className="text-lg font-black text-slate-900">
                                {tipoAcao === 'desativar' && 'Desativar Prestador'}
                                {tipoAcao === 'reativar' && 'Reativar Prestador'}
                                {tipoAcao === 'sinalizar' && 'Sinalizar Prestador'}
                                {tipoAcao === 'promoverAdmin' && 'Promover a Administrador'}
                                {tipoAcao === 'removerAdmin' && 'Remover Privilégios de Admin'}
                            </h3>
                        </div>

                        <form onSubmit={executarAcao} className="space-y-4">
                            {(tipoAcao === 'desativar' || tipoAcao === 'sinalizar') && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Motivo (opcional)</label>
                                    <textarea
                                        value={motivoAcao}
                                        onChange={(e) => setMotivoAcao(e.target.value)}
                                        placeholder="Explique o motivo dessa ação..."
                                        rows={4}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition resize-none"
                                    />
                                </div>
                            )}

                            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTipoAcao(null);
                                        setMotivoAcao('');
                                    }}
                                    className="px-4 py-2 text-sm font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={enviandoAcao}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Send size={14} />
                                    {enviandoAcao ? 'Processando...' : 'Confirmar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── MODAL DE CONFIRMAÇÃO DE BANIMENTO ─── */}
            {tipoAcao === 'banir' && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-xl p-6 relative">
                        <button
                            onClick={() => {
                                setTipoAcao(null);
                                setConfirmarBanimento(false);
                                setMotivoAcao('');
                            }}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
                        >
                            <X size={18} />
                        </button>

                        {!confirmarBanimento ? (
                            <div>
                                <div className="mb-4">
                                    <h3 className="text-lg font-black text-slate-900">Banir Prestador</h3>
                                    <p className="text-sm text-slate-500 mt-2">
                                        Você tem certeza que deseja <strong>banir permanentemente</strong> o prestador <strong>{prestador.nome}</strong>?
                                    </p>
                                    <p className="text-sm text-rose-600 font-semibold mt-3">
                                        ⚠️ Esta ação é irreversível!
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTipoAcao(null);
                                            setConfirmarBanimento(false);
                                        }}
                                        className="flex-1 px-4 py-2 text-sm font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmarBanimento(true)}
                                        className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition flex items-center justify-center gap-2"
                                    >
                                        <Ban size={14} />
                                        Sim, Banir
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="mb-4">
                                    <h3 className="text-lg font-black text-slate-900">Confirmar Banimento</h3>
                                    <p className="text-sm text-slate-500 mt-2">
                                        Insira o motivo do banimento para confirmar:
                                    </p>
                                </div>

                                <form onSubmit={executarAcao} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Motivo do Banimento</label>
                                        <textarea
                                            value={motivoAcao}
                                            onChange={(e) => setMotivoAcao(e.target.value)}
                                            placeholder="Explique o motivo deste banimento..."
                                            rows={4}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition resize-none"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setConfirmarBanimento(false)}
                                            className="px-4 py-2 text-sm font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                                        >
                                            Voltar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={enviandoAcao || !motivoAcao.trim()}
                                            className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Ban size={14} />
                                            {enviandoAcao ? 'Processando...' : 'Confirmar Banimento'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
