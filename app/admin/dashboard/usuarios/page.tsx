'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Users as UsersIcon, Wrench, ShieldAlert, 
  Ticket, AlertTriangle, Handshake, Settings, LogOut, 
  Send, Eye
} from 'lucide-react';

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

export default function Usuarios() {
  const id_solicitante = 1; // ID padrão do administrador para autorização da rota

  const [metrics, setMetrics] = useState<DashboardData | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        
        // 1. Resumo numérico geral (Métricas de Usuários e Suporte)
        const resMetrics = await fetch(`/api/usuario?admin=dashboard&id_solicitante=${id_solicitante}`);
        const dataMetrics = await resMetrics.json();
        setMetrics(dataMetrics);

        // 2. CORREÇÃO: Adicionado o fetch para carregar a lista real de utilizadores recentes
        const resUsers = await fetch(`/api/usuario?admin=usuarios&id_solicitante=${id_solicitante}`);
        const dataUsers = await resUsers.json();
        
        // Atualiza o estado com o array vindo da API (limitando aos 5 mais recentes se necessário)
        setRecentUsers(Array.isArray(dataUsers) ? dataUsers.slice(0, 5) : []);

      } catch (error) {
        console.error("Erro ao integrar componentes do painel:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-sm font-medium text-indigo-600 bg-white rounded-3xl border border-slate-100 shadow-sm">
        A carregar utilizadores recentes...
      </div>
    );
  }

  return (
    <div className="bg-white m-10 p-6 rounded-3xl border border-slate-100 shadow-sm ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-900">Usuários recentes</h2>
        <a href="/admin/dashboard" className="text-sm font-semibold text-indigo-600 hover:underline">Voltar</a>
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
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <tr key={user.id_usuario} className="hover:bg-slate-50/50 transition">
                  <td className="p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold uppercase text-xs">
                      {user.nome.charAt(0)}
                    </div>
                    <div className="truncate max-w-[140px]">
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
                      <Link
                        href={`/admin/usuarios/${user.id_usuario}`}
                        className="hover:text-indigo-600 p-1"
                        aria-label={`Visualizar usuário ${user.nome}`}
                      >
                        <Eye size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center p-8 text-slate-400 text-xs">
                  Nenhum utilizador encontrado no sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
