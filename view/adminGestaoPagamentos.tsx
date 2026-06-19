'use client';

import React, { useState, useEffect } from 'react';
import { 
    ArrowUpRight, Users, AlertTriangle, XCircle, 
    ArrowLeft, Bell, MoreVertical, CreditCard 
} from 'lucide-react';

// Interface mapeando o retorno exato do seu AssinaturaPlanoService.listar()
interface AssinaturaPlano {
    id_assinatura: number;
    valor_pago: number;
    data_inicio: string;
    data_fim: string;
    status_pagamento: 'pendente' | 'pago' | 'cancelado' | 'expirado';
    ativo: boolean;
    prestador: {
        id_usuario: number;
        nome: string;
        email: string;
        telefone: string;
        foto_perfil: string | null;
        cidade: string;
        categoria_principal: string;
    };
}

export default function GestaoPagamentos() {
    const [assinaturas, setAssinaturas] = useState<AssinaturaPlano[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados Analíticos Superiores calculados em tempo real com base no banco
    const [metrics, setMetrics] = useState({
        receitaTotal: 0,
        assinaturasAtivas: 0,
        pagamentosVencidos: 0,
        transacoesFalhas: 0
    });

    useEffect(() => {
        async function loadPagamentos() {
            try {
                // Rota que chama o método AssinaturaPlanoService.listar()
                const res = await fetch('/api/assinaturaPlano');
                const data = await res.json();

                if (Array.isArray(data)) {
                    setAssinaturas(data);

                    // Agregações dinâmicas a partir do retorno real do banco de dados
                    const receita = data.reduce((acc, curr) => curr.status_pagamento === 'pago' ? acc + Number(curr.valor_pago) : acc, 0);
                    const ativas = data.filter(item => item.ativo).length;
                    const vencidos = data.filter(item => item.status_pagamento === 'expirado').length;
                    const falhas = data.filter(item => item.status_pagamento === 'cancelado').length;

                    setMetrics({
                        receitaTotal: receita,
                        assinaturasAtivas: ativas,
                        pagamentosVencidos: vencidos,
                        transacoesFalhas: falhas
                    });
                }
            } catch (error) {
                console.error("Erro ao carregar ecossistema de pagamentos:", error);
            } finally {
                setLoading(false);
            }
        }
        loadPagamentos();
    }, []);

    // Helpers estéticos para renderização de status das linhas da tabela
    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pago':
                return 'bg-emerald-100 text-emerald-700 font-semibold text-xs px-2.5 py-1 rounded-md';
            case 'pendente':
                return 'bg-amber-100 text-amber-700 font-semibold text-xs px-2.5 py-1 rounded-md';
            case 'expirado':
            case 'vencido':
                return 'bg-rose-100 text-rose-700 font-semibold text-xs px-2.5 py-1 rounded-md';
            default:
                return 'bg-slate-100 text-slate-600 font-semibold text-xs px-2.5 py-1 rounded-md';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-8">
            
            {/* Cabeçalho */}
            <header className="mb-8 flex items-center gap-4">
                <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-slate-900">Gestão de Pagamentos</h1>
            </header>

            {/* ─── ROW 1: CARDS ANALÍTICOS SUPERIORES ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                
                {/* Receita Total */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Receita Total</p>
                        <span className="p-2 rounded-xl bg-blue-50 text-blue-600"><ArrowUpRight size={18} /></span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">
                        R$ {metrics.receitaTotal > 0 ? metrics.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0'}
                    </h3>
                    <div className="w-24 h-8 bg-blue-50/40 rounded-lg mt-3 flex items-center justify-center text-[11px] font-bold text-blue-600">
                        📈 Crescente
                    </div>
                </div>

                {/* Assinaturas Ativas */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assinaturas Ativas</p>
                        <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><Users size={18} /></span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">
                        {metrics.assinaturasAtivas > 0 ? metrics.assinaturasAtivas.toLocaleString('pt-BR') : '0'}
                    </h3>
                    <div className="w-24 h-8 bg-emerald-50/40 rounded-lg mt-3 flex items-center justify-center text-[11px] font-bold text-emerald-600">
                        👥 Em uso
                    </div>
                </div>

                {/* Pagamentos Vencidos */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pagamentos Vencidos</p>
                        <span className="p-2 rounded-xl bg-amber-50 text-amber-600"><AlertTriangle size={18} /></span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">
                        {metrics.pagamentosVencidos > 0 ? metrics.pagamentosVencidos : '0'}
                    </h3>
                    <div className="w-24 h-8 bg-amber-50/40 rounded-lg mt-3 flex items-center justify-center text-[11px] font-bold text-amber-600">
                        ⚠️ Atenção
                    </div>
                </div>

                {/* Transações Falhas */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transações Falhas</p>
                        <span className="p-2 rounded-xl bg-rose-50 text-rose-600"><XCircle size={18} /></span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">
                        {metrics.transacoesFalhas > 0 ? metrics.transacoesFalhas : '0'}
                    </h3>
                    <div className="w-24 h-8 bg-rose-50/40 rounded-lg mt-3 flex items-center justify-center text-[11px] font-bold text-rose-600">
                        ❌ Recusadas
                    </div>
                </div>
            </div>

            {/* ─── ROW 2: TABELA DE ASSINATURAS E CENTRAL DE NOTIFICAÇÕES ─── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8 items-start">
                
                {/* Tabela de Visão Geral (Preenchendo 2 colunas no XL) */}
                <div className="xl:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Visão Geral das Assinaturas</h2>
                        <button className="text-sm font-semibold text-blue-600 hover:underline">Ver todas</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-bold text-slate-400 bg-slate-50 border-b border-slate-100/60">
                                    <th className="p-4">Nome do Prestador</th>
                                    <th className="p-4">Taxa Mensal</th>
                                    <th className="p-4">Status de Pagamento</th>
                                    <th className="p-4">Último Pagamento</th>
                                    <th className="p-4">Próximo Vencimento</th>
                                    <th className="p-4 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-sm text-slate-400">
                                            Carregando dados estruturados...
                                        </td>
                                    </tr>
                                ) : assinaturas.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-sm text-slate-400">
                                            Nenhum plano registrado no banco.
                                        </td>
                                    </tr>
                                ) : (
                                <>
                                    {assinaturas.map((item) => (
                                        <tr key={item.id_assinatura} className="text-sm hover:bg-slate-50/50 transition">
                                            <td className="p-4 font-semibold text-slate-800 truncate">{item.prestador?.nome || `Prestador #${item.prestador?.id_usuario}`}</td>
                                            <td className="p-4 text-slate-600">R$ {Number(item.valor_pago).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                            <td className="p-4"><span className={getStatusStyle(item.status_pagamento)}>{item.status_pagamento}</span></td>
                                            <td className="p-4 text-xs text-slate-500">{new Date(item.data_inicio).toLocaleDateString('pt-BR')}</td>
                                            <td className="p-4 text-xs text-slate-500">{new Date(item.data_fim).toLocaleDateString('pt-BR')}</td>
                                            <td className="p-4 text-center"><button className="text-slate-400 hover:text-slate-600"><MoreVertical size={16} /></button></td>
                                        </tr>
                                    ))}
                                </>
                            )}
                            </tbody>
                        </table>
                        </div>
                    </div>

                {/* Bloco Lateral: Notificações Financeiras Instantâneas */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Notificações</h2>
                        <Bell size={18} className="text-slate-400" />
                    </div>
                    
                    <div className="space-y-4 max-h-[360px] overflow-y-auto">
                        <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-xl flex gap-3 items-start">
                            <span className="text-amber-600 mt-0.5"><AlertTriangle size={16} /></span>
                            <div>
                                <p className="text-xs font-bold text-slate-800">Assinatura Vencida</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">7 Horas atrás</p>
                            </div>
                        </div>
                        <div className="bg-rose-50/60 border border-rose-100 p-4 rounded-xl flex gap-3 items-start">
                            <span className="text-rose-600 mt-0.5"><XCircle size={16} /></span>
                            <div>
                                <p className="text-xs font-bold text-slate-800">Falha no Pagamento do Usuário John Doe</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">2 Horas atrás</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── ROW 3: DETALHAMENTO DE HISTÓRICO E GRÁFICOS ANALÍTICOS ─── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                
                {/* Lista Secundária: Histórico Geral de Transações */}
                <div className="xl:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Pagamentos de Usuários</h2>
                    </div>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {assinaturas.slice(0, 5).map((item) => (
                            <div key={item.id_assinatura} className="flex justify-between items-center p-4 bg-slate-50/50 border border-slate-100/60 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><CreditCard size={16} /></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{item.prestador?.nome || 'Prestador Alternativo'}</p>
                                        <p className="text-[11px] text-slate-400">{item.prestador?.categoria_principal || 'Serviços Gerais'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className={getStatusStyle(item.status_pagamento)}>{item.status_pagamento}</span>
                                    <p className="text-sm font-bold text-slate-900">R$ {Number(item.valor_pago).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dashboard Gráfico de Status e Distribuição Mensal */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h2 className="text-base font-bold text-slate-900 mb-6">Distribuição dos Status de Pagamento</h2>
                    
                    {/* Elemento Donut Chart customizado em CSS para representação sem bibliotecas externas */}
                    <div className="flex flex-col items-center justify-center space-y-6 py-2">
                        <div className="relative w-36 h-36 rounded-full border-[16px] border-emerald-500 flex items-center justify-center before:absolute before:inset-0 before:rounded-full before:border-[16px] before:border-amber-400 before:clip-path-donut">
                            <div className="text-center">
                                <p className="text-2xl font-black text-slate-900">{assinaturas.length}</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total</p>
                            </div>
                        </div>

                        {/* Legendas customizadas */}
                        <div className="grid grid-cols-2 gap-4 w-full text-xs">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 block" /> <span>Pago</span></div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400 block" /> <span>Pendente</span></div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500 block" /> <span>Vencido</span></div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-400 block" /> <span>Falho</span></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}