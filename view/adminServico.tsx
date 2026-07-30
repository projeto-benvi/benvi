'use client';

import React, { useState, useEffect } from 'react';
import {
    Users, Wrench, UserCheck, MapPin, UserPlus, Info, Send, Calendar
} from 'lucide-react';

interface CidadeAtendida {
    id_cidade: number;
    cidade: string;
    estado: string;
}

export default function CentralAlertas() {
    // Carregamento de dados das Cidades
    const [cidades, setCidades] = useState<CidadeAtendida[]>([]);
    const [loading, setLoading] = useState(false);

    // --- Estados do Formulário Vinculados ao Backend ---
    const [titulo, setTitulo] = useState('');
    const [tipoAlerta, setTipoAlerta] = useState('Sistema'); // Mapeia para "categoria" no banco
    const [destinatario, setDestinatario] = useState('Todos os usuários');
    const [cidadeSelecionada, setCidadeSelecionada] = useState('');
    const [grupoPersonalizado, setGrupoPersonalizado] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [agendamento, setAgendamento] = useState<'AGORA' | 'AGENDAR'>('AGORA');

    // Buscar cidades do banco para o Select
    useEffect(() => {
        async function fetchCidades() {
            try {
                const res = await fetch(`/api/cidadeAtendida`);
                const data = await res.json();
                if (Array.isArray(data)) setCidades(data);
            } catch (error) {
                console.error("Erro ao buscar cidades:", error);
            }
        }
        fetchCidades();
    }, []);

    // Envio do formulário ajustado para o formato da tabela ALERTA
    // Envio do formulário ajustado com o ID do usuário necessário
    const handleCreateAlert = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!titulo || !mensagem) {
            return alert("Por favor, preencha os campos obrigatórios de Título e Mensagem!");
        }

        try {
            setLoading(true);

            // 1. Definição da prioridade baseada na categoria escolhida
            let prioridadeCalculada = 2; // Média por padrão
            if (tipoAlerta === 'Urgente') prioridadeCalculada = 3;

            // 2. URL de ação baseada na cidade selecionada
            const urlGerada = cidadeSelecionada
                ? `https://benvi.com/painel?cidade=${encodeURIComponent(cidadeSelecionada)}`
                : 'https://benvi.com/painel';

            // 3. Monta o payload incluindo o id_usuario exigido pelo relacionamento do banco
            const payload = {
                id_usuario: 3,          // ID do usuário destino (obrigatório para a NOTIFICACAO)
                titulo: titulo,         // Vai para a tabela NOTIFICACAO
                descricao: mensagem,    // Vai para a tabela NOTIFICACAO (campo descricao)
                prioridade: prioridadeCalculada, // Vai para a tabela ALERTA
                categoria: tipoAlerta,  // Vai para a tabela ALERTA
                url_acao: urlGerada,    // Vai para a tabela ALERTA
            };

            const response = await fetch(`/api/alerta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Alerta criado com sucesso!");
                setTitulo('');
                setMensagem('');
                setCidadeSelecionada('');
            } else {
                const errData = await response.json();
                alert(`Falha ao submeter o alerta: ${errData.erro || 'Erro interno no servidor (500)'}`);
            }
        } catch (error) {
            console.error("Erro ao conectar com a API:", error);
            alert("Erro de rede ao tentar cadastrar o alerta.");
        } finally {
            setLoading(false);
        }
    };

    const tiposDestinatarios = [
        { id: 'Todos os usuários', label: 'Todos os usuários', sub: 'enviar para toda a plataforma', icon: <Users size={24} /> },
        { id: 'Prestadores', label: 'Prestadores', sub: 'enviar apenas para prestadores', icon: <Wrench size={24} /> },
        { id: 'Clientes', label: 'Clientes', sub: 'enviar apenas para clientes', icon: <UserPlus size={24} /> },
        { id: 'Usuários verificados', label: 'Usuários verificados', sub: 'apenas usuários verificados', icon: <UserCheck size={24} /> },
        { id: 'Cidade específica', label: 'Cidade específica', sub: 'enviar apenas para uma cidade', icon: <MapPin size={24} /> },
        { id: 'Grupo específico', label: 'Grupo específico', sub: 'enviar para toda a plataforma', icon: <Users size={24} /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 sm:p-6 lg:p-8">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Central de alertas</h1>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

                {/* ─── FORMULÁRIO PRINCIPAL ─── */}
                <form onSubmit={handleCreateAlert} className="xl:col-span-2 bg-white p-4 sm:p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Criar novo alerta</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Título do alerta *</label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Digite o título do alerta"
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipos de alertas</label>
                            <select
                                value={tipoAlerta}
                                onChange={(e) => setTipoAlerta(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 appearance-none"
                            >
                                <option value="Sistema">Sistema</option>
                                <option value="Geral">Informativo Geral</option>
                                <option value="Urgente">Aviso Urgente</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2.5">Destinatários *</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {tiposDestinatarios.map((dest) => {
                                const active = destinatario === dest.id;
                                return (
                                    <button
                                        key={dest.id}
                                        type="button"
                                        onClick={() => setDestinatario(dest.id)}
                                        className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all relative ${active
                                                ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20'
                                                : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-xl ${active ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-600'}`}>
                                            {dest.icon}
                                        </div>
                                        <div className="pr-4">
                                            <p className={`text-sm font-bold leading-snug ${active ? 'text-blue-600' : 'text-slate-800'}`}>{dest.label}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{dest.sub}</p>
                                        </div>
                                        {active && (
                                            <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold shadow-sm">
                                                ✓
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Selecionar cidade (opcional)</label>
                            <select
                                value={cidadeSelecionada}
                                onChange={(e) => setCidadeSelecionada(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
                            >
                                <option value="">Selecione uma cidade...</option>
                                {cidades.map((c) => (
                                    <option key={c.id_cidade} value={c.cidade}>{c.cidade} - {c.estado}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Grupo personalizado (opcional)</label>
                            <select
                                value={grupoPersonalizado}
                                onChange={(e) => setGrupoPersonalizado(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
                            >
                                <option value="">Selecione um grupo...</option>
                                <option value="prestadores_premium">Prestadores Premium</option>
                                <option value="novos_usuarios">Novos cadastros</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Mensagem do alerta *</label>
                        <textarea
                            rows={5}
                            value={mensagem}
                            onChange={(e) => setMensagem(e.target.value)}
                            placeholder="Escreva o conteúdo resumido que será exibido aos seus usuários..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setAgendamento('AGORA')}
                                className={`flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg transition-all w-1/2 sm:w-auto ${agendamento === 'AGORA' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                                    }`}
                            >
                                <Send size={14} /> ENVIAR AGORA
                            </button>

                            {/* 
                            <button
                                type="button"
                                onClick={() => setAgendamento('AGENDAR')}
                                className={`flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg transition-all w-1/2 sm:w-auto ${
                                    agendamento === 'AGENDAR' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                                }`}
                            >
                                <Calendar size={14} /> AGENDAR
                            </button>
                            
                            */}

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition disabled:opacity-50"
                        >
                            {loading ? 'ENVIANDO...' : 'ENVIAR ALERTA'}
                        </button>
                    </div>
                </form>

                {/* ─── CARD DE PREVIEW REAL-TIME ─── */}
                <aside className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 sticky top-8">
                    <h3 className="text-base font-bold text-slate-900">Preview do alerta</h3>

                    <div className="border border-blue-100 bg-blue-50/30 rounded-2xl p-5 flex gap-4 max-w-sm mx-auto shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                            <Info size={20} />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-baseline gap-2">
                                <h4 className="text-sm font-bold text-slate-900 truncate max-w-[150px]">
                                    {titulo || 'Titulo do alerta'}
                                </h4>
                                <span className="text-[10px] font-semibold text-blue-500 lowercase tracking-wide bg-blue-50 px-2 py-0.5 rounded-md">
                                    {tipoAlerta.toLowerCase()}
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed break-words">
                                {mensagem || 'Mensagem de alerta de teste para visualização em tempo real. Preencha os campos acima para ver a prévia do alerta que será enviado aos usuários.'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                                enviado por Benvi • Agora mesmo
                            </p>
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    );
}
