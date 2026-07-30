'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface TicketSuporte {
    id_ticket: number;
    id_usuario: number;
    titulo: string;
    descricao: string;
    status: 'Aberto' | 'Em Andamento' | 'Fechado';
    resposta_admin: string | null;
    data_abertura: string;
    data_encerramento: string | null;
}

export default function SuporteTickets() {
    const [tickets, setTickets] = useState<TicketSuporte[]>([]);
    const [loading, setLoading] = useState(true);

    // Buscar os tickets da API criada no seu Backend
    useEffect(() => {
        async function fetchTickets() {
            try {
                const res = await fetch(`/api/ticketSuporte`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setTickets(data);
                }
            } catch (error) {
                console.error("Erro ao buscar tickets de suporte:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTickets();
    }, []);

    // Ação temporária enquanto a tela de resposta não existe
    const handleViewTicket = (ticket: TicketSuporte) => {
        alert(
            `Visualizando Ticket #${ticket.id_ticket}\n\n` +
            `Usuário: ID ${ticket.id_usuario}\n` +
            `Título: ${ticket.titulo}\n` +
            `Descrição: ${ticket.descricao}\n` +
            `Status: ${ticket.status}\n\n` +
            `Lógica de resposta ou abertura de modal pode ser inserida aqui futuramente.`
        );
    };

    // Helper para badge de status estilizado
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Fechado':
                return (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle size={12} /> fechado
                    </span>
                );
            case 'Em Andamento':
                return (
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock size={12} /> em andamento
                    </span>
                );
            default:
                return (
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertCircle size={12} /> aberto
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 sm:p-6 lg:p-8">
            {/* Header seguindo a estrutura do painel */}
            <header className="mb-6 flex items-center gap-4">
                <button 
                    onClick={() => window.history.back()}
                    className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tickets de Suporte</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Gerencie os problemas e chamados abertos pelos usuários</p>
                </div>
            </header>

            {/* Container Pai Alinhado ao Centro */}
            <div className="w-full flex flex-col items-center"> 
                
                {/* Wrapper Max-Width Centralizado */}
                <div className="max-w-4xl w-full justify-center space-y-4 mx-auto">
                                    
                    {loading ? (
                        <div className="text-center py-12 text-slate-400 text-sm">
                            Carregando chamados de suporte...
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm bg-white border border-slate-100 rounded-3xl">
                            Nenhum ticket encontrado no momento.
                        </div>
                    ) : (
                        tickets.map((ticket) => (
                            <div 
                                key={ticket.id_ticket}
                                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex gap-4 transition-all hover:border-blue-100 relative group"
                            >
                                {/* Ícone Lateral Identificador */}
                                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center .flex-shrink-0">
                                    <Ticket size={20} />
                                </div>

                                {/* Conteúdo do Card */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-baseline gap-2 pr-20">
                                        <h4 className="text-sm font-bold text-slate-900 truncate max-w-md">
                                            {ticket.titulo}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400">
                                                Usuário #{ticket.id_usuario}
                                            </span>
                                            {getStatusBadge(ticket.status)}
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-600 leading-relaxed .break-words bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 mr-20">
                                        {ticket.descricao}
                                    </p>

                                    {/* Resposta do Administrador (Caso Exista) */}
                                    {ticket.resposta_admin && (
                                        <div className="mt-3 text-xs bg-blue-50/30 border border-blue-100 rounded-xl p-3 space-y-1 mr-20">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Resposta do Admin:</p>
                                            <p className="text-slate-700 leading-relaxed">{ticket.resposta_admin}</p>
                                        </div>
                                    )}

                                    {/* Rodapé com Metadados */}
                                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 pr-20">
                                        <p>Aberto em: {new Date(ticket.data_abertura).toLocaleString('pt-BR')}</p>
                                        {ticket.data_encerramento && (
                                            <p className="text-emerald-600">Encerrado em: {new Date(ticket.data_encerramento).toLocaleString('pt-BR')}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Botão Visualizar - Posicionado de forma fixa à direita, idêntico ao "Analizar" */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                                    <button
                                        onClick={() => handleViewTicket(ticket)}
                                        className="text-xs font-semibold text-orange-500 bg-orange-50 hover:bg-orange-100 px-4 py-1.5 rounded-full transition-colors duration-150"
                                    >
                                        Visualizar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                </div>
            </div>
        </div>
    );
}
