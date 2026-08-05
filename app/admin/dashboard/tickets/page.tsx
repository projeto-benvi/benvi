'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ticket, Eye } from 'lucide-react';

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

export default function TicketsRecentes() {
  const [tickets, setTickets] = useState<TicketSuporte[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        // Faz a chamada para a sua API de tickets de suporte
        const res = await fetch('/api/ticketSuporte');
        const data = await res.json();
        
        // Armazena os dados vindos da API (mostrando os 6 mais recentes)
        setTickets(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (error) {
        console.error("Erro ao carregar os tickets:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-sm font-medium text-orange-600 bg-white rounded-3xl border border-slate-100 shadow-sm">
        A carregar tickets recentes...
      </div>
    );
  }

  return (
    <div className="bg-white m-10 p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-900">Tickets Recentes</h2>
        <a href="/admin/dashboard" className="text-sm font-semibold text-indigo-600 hover:underline">Voltar</a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-bold text-slate-400 bg-slate-50">
              <th className="p-3">Título</th>
              <th className="p-3">Descrição</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aberto em</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <tr key={ticket.id_ticket} className="hover:bg-slate-50/50 transition">
                  <td className="p-3 font-semibold text-slate-800 max-w-[140px] truncate">
                    {ticket.titulo}
                  </td>
                  <td className="p-3 text-slate-500 max-w-[200px] truncate">
                    {ticket.descricao}
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${
                      ticket.status.toLowerCase() === 'aberto' || ticket.status.toLowerCase() === 'pendente'
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-xs">
                    {ticket.data_abertura ? new Date(ticket.data_abertura).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1 text-slate-400">
                      <Link
                        href={`/admin/verificarTicket?id=${ticket.id_ticket}`}
                        className="hover:text-indigo-600 p-1"
                        title="Visualizar ticket"
                        aria-label={`Visualizar ticket ${ticket.id_ticket}`}
                      >
                        <Eye size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-8 text-slate-400 text-xs">
                  Nenhum ticket registado no momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
