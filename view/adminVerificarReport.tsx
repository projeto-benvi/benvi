'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShieldAlert, Clock, CheckCircle, AlertCircle, 
  XCircle, User, Save, Ban, Check, ShieldCheck, Mail, Link2
} from 'lucide-react';

interface ReporteDetalhado {
  id_reporte: number;
  assunto: string;
  arquivo?: string | null;
  tipo_problema: string;
  descricao: string;
  status: 'pendente' | 'em_analise' | 'resolvido' | 'arquivado' | string;
  data_reporte: string;
  id_usuario_reportou: number;
  nome_reportou: string;
  email_reportou: string;
  foto_reportou?: string | null;
  id_usuario_reportado: number;
  nome_reportado: string;
  email_reportado: string;
  foto_reportado?: string | null;
  id_admin?: number | null;
  nome_admin?: string | null;
}

export default function AdminVerificarReport() {
  const [reporte, setReporte] = useState<ReporteDetalhado | null>(null);
  const [loading, setLoading] = useState(true);
  const [idSolicitante, setIdSolicitante] = useState<number>(1); // Id do admin logado

  // Formulário de Moderação
  const [novoStatus, setNovoStatus] = useState('pendente');
  const [submitting, setSubmitting] = useState(false);
  const [statusInfrator, setStatusInfrator] = useState<string>('ativo');

  // Capturar ID da URL e carregar dados
  useEffect(() => {
    async function carregarDados() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const idReporte = urlParams.get('id');
        if (!idReporte) return;

        setLoading(true);
        // 1. Carregar Detalhes do Reporte
        const resReporte = await fetch(`/api/reporte/${idReporte}`);
        if (!resReporte.ok) throw new Error("Reporte não encontrado");
        const dataReporte = await resReporte.json();
        setReporte(dataReporte);
        setNovoStatus(dataReporte.status);

        // 2. Consultar o status da conta do Infrator direto no backend usuário
        const resUser = await fetch(`/api/usuario/${dataReporte.id_usuario_reportado}`);
        if (resUser.ok) {
          const dataUser = await resUser.json();
          setStatusInfrator(dataUser.status_conta || 'ativo');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  // Salvar Modificações de Status do Reporte
  const handleSalvarStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporte) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/reporte/${reporte.id_reporte}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus, id_admin: idSolicitante })
      });

      if (res.ok) {
        setReporte(prev => prev ? { ...prev, status: novoStatus } : null);
        alert("Status do reporte atualizado com sucesso!");
      } else {
        alert("Erro ao atualizar o status.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Aplicar Bloqueio/Desativação de Conta do Alvo Denunciado (Soft-Delete integrado)
  const handleBanirUsuario = async () => {
    if (!reporte) return;
    const acao = statusInfrator === 'ativo' ? 'desativar' : 'reativar';
    const confirmMsg = acao === 'desativar' 
      ? `Deseja realmente DESATIVAR a conta de ${reporte.nome_reportado}? O usuário perderá o acesso à plataforma.`
      : `Deseja REATIVAR a conta de ${reporte.nome_reportado}?`;

    if (!confirm(confirmMsg)) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/usuario/${reporte.id_usuario_reportado}?admin=${acao}&id_solicitante=${idSolicitante}`, {
        method: 'PATCH'
      });

      if (res.ok) {
        const novoStatusConta = acao === 'desativar' ? 'inativo' : 'ativo';
        setStatusInfrator(novoStatusConta);
        alert(`Conta do usuário atualizada para: ${novoStatusConta.toUpperCase()}`);
      } else {
        const errData = await res.json();
        alert(`Erro: ${errData.erro || 'Falha na operação.'}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400 font-medium gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        A processar auditoria...
      </div>
    );
  }

  if (!reporte) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 text-center text-slate-500 font-medium">
        Reporte não localizado ou removido.
        <br />
        <a href="/admin/reportes" className="text-indigo-600 underline mt-2 inline-block">Voltar para a lista</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation back */}
        <a 
          href="/admin/reportes" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition mb-6 group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> 
          Voltar para a Listagem de Reportes
        </a>

        {/* Main Content Box */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* Header Area */}
          <div className="bg-slate-900 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs bg-white/10 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-slate-300">
                  ID #{reporte.id_reporte}
                </span>
                <span className="text-xs bg-indigo-500/20 px-2.5 py-1 rounded-md font-semibold text-indigo-300">
                  Tipo: {reporte.tipo_problema}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mt-3 text-slate-50">
                {reporte.assunto}
              </h2>
            </div>
            
            <div className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-xl border border-slate-800/40 min-w-[180px]">
              <p className="text-slate-500 font-semibold uppercase tracking-wider">Abertura do reporte</p>
              <p className="text-sm font-bold text-slate-200 mt-1">
                {new Date(reporte.data_reporte).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-slate-400">às {new Date(reporte.data_reporte).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left and Central Information Grid */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Envolvidos Profiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Denunciante */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-purple-500 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-bl">Denunciante</div>
                  <div className="flex items-center gap-3">
                    {reporte.foto_reportou ? (
                      <img src={reporte.foto_reportou} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold"><User size={18} /></div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{reporte.nome_reportou}</p>
                      <p className="text-xs text-slate-400 truncate flex items-center gap-1"><Mail size={12}/>{reporte.email_reportou}</p>
                    </div>
                  </div>
                </div>

                {/* Infrator/Alvo */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-red-500 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-bl">Reportado</div>
                  <div className="flex items-center gap-3">
                    {reporte.foto_reportado ? (
                      <img src={reporte.foto_reportado} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold"><User size={18} /></div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{reporte.nome_reportado || reporte.nome_reportado}</p>
                      <p className="text-xs text-slate-400 truncate flex items-center gap-1"><Mail size={12}/>{reporte.email_reportado || reporte.email_reportado}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descrição do Incidente */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert size={14} /> Histórico & Descrição do Incidente
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap shadow-inner">
                  {reporte.descricao}
                </div>
              </div>

              {/* Arquivos de Evidência / Anexos */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evidências / Anexo</h4>
                {reporte.arquivo ? (
                  <a 
                    href={reporte.arquivo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-indigo-100 rounded-xl text-sm font-semibold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 transition"
                  >
                    <Link2 size={18} />
                    <span className="flex-1 truncate">Aceder ao Arquivo Anexo de Prova</span>
                  </a>
                ) : (
                  <div className="p-3 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium text-center">
                    Nenhum documento ou imagem foi anexado a esta denúncia.
                  </div>
                )}
              </div>
            </div>

            {/* Right Action/Moderation Control Area */}
            <div className="space-y-6 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-6">
              
              {/* Form Status Mod */}
              <form onSubmit={handleSalvarStatus} className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ações de Status</h4>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Alterar Fluxo:</label>
                  <select
                    value={novoStatus}
                    onChange={(e) => setNovoStatus(e.target.value)}
                    className="w-full text-sm font-medium border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="pendente">⏳ Aberto / Pendente</option>
                    <option value="em_analise">🔍 Em Investigação</option>
                    <option value="resolvido">✅ Marcar Concluído</option>
                    <option value="arquivado">📁 Arquivar Registro</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Save size={16} />
                  {submitting ? 'A guardar...' : 'Atualizar Reporte'}
                </button>
              </form>

              <hr className="border-slate-100" />

              {/* Sanções Disciplinares ao Usuário Infrator */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sanções Administrativas</h4>
                
                <div className="p-3 rounded-xl border flex flex-col gap-2 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Conta Alvo:</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      statusInfrator === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {statusInfrator}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleBanirUsuario}
                    disabled={submitting}
                    className={`w-full text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 border ${
                      statusInfrator === 'ativo' 
                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    <Ban size={14} />
                    {statusInfrator === 'ativo' ? 'Desativar Conta Infratora' : 'Reativar Conta Infratora'}
                  </button>
                </div>
              </div>

              {/* Informações Extras de Auditoria */}
              {reporte.nome_admin && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1">
                  <span className="font-bold text-slate-400 block uppercase tracking-wider text-[10px]">Auditado por:</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 mt-1">
                    <ShieldCheck size={14} className="text-emerald-600" /> {reporte.nome_admin}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
