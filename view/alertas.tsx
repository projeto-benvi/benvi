"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import SearchBar from "@/components/searchBar";
import { AlertTriangle, CheckCircle, Filter, Plus, Trash2 } from "lucide-react";

interface AlertaItem {
  id_alerta: number;
  id_usuario: number;
  titulo: string;
  descricao: string;
  prioridade: number;
  categoria: string;
  status: string;
  data_criacao?: string;
  data_envio?: string;
  data_expiracao?: string;
}

export default function AlertasView() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [alertas, setAlertas] = useState<AlertaItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [prioridadeFiltro, setPrioridadeFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState({ titulo: "", descricao: "", prioridade: "2", categoria: "geral", id_usuario: "" });

  const isAdmin = Boolean(user?.isAdmin || user?.is_admin);

  async function carregarAlertas() {
    if (!user?.id) return;
    try {
      setCarregando(true);
      setErro("");
      const params = new URLSearchParams();
      if (!isAdmin) params.set("id_usuario", String(user.id));
      if (statusFiltro) params.set("status", statusFiltro);
      if (prioridadeFiltro) params.set("prioridade", prioridadeFiltro);
      if (categoriaFiltro) params.set("categoria", categoriaFiltro);
      const response = await fetch("/api/alerta?" + params.toString(), { cache: "no-store" });
      const dados = await response.json().catch(() => []);
      if (!response.ok) throw new Error(dados.erro || "Erro ao carregar alertas.");
      setAlertas(Array.isArray(dados) ? dados : []);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar alertas.");
      setAlertas([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarAlertas();
  }, [user?.id, statusFiltro, prioridadeFiltro, categoriaFiltro]);

  async function criarAlerta(event: React.FormEvent) {
    event.preventDefault();
    const idDestino = Number(form.id_usuario || user?.id);
    if (!idDestino || !form.titulo.trim() || !form.descricao.trim() || !form.categoria.trim()) {
      setErro("Informe usuário, título, descrição e categoria.");
      return;
    }

    try {
      setCriando(true);
      setErro("");
      const response = await fetch("/api/alerta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: idDestino,
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim(),
          prioridade: Number(form.prioridade),
          categoria: form.categoria.trim(),
          url_acao: "/alerta",
        }),
      });
      const dados = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(dados.erro || "Erro ao criar alerta.");
      setForm({ titulo: "", descricao: "", prioridade: "2", categoria: "geral", id_usuario: "" });
      await carregarAlertas();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao criar alerta.");
    } finally {
      setCriando(false);
    }
  }

  async function atualizarStatus(id: number, status: string) {
    const response = await fetch("/api/alerta/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) await carregarAlertas();
  }

  async function excluirAlerta(id: number) {
    if (!confirm("Excluir este alerta?")) return;
    const response = await fetch("/api/alerta/" + id, { method: "DELETE" });
    if (response.ok) await carregarAlertas();
  }

  const categorias = useMemo(() => Array.from(new Set(alertas.map((a) => a.categoria).filter(Boolean))), [alertas]);

  const classePrioridade = (prioridade: number) => {
    if (prioridade >= 3) return "bg-red-50 text-red-600";
    if (prioridade === 2) return "bg-orange-50 text-orange-600";
    return "bg-blue-50 text-blue-600";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SearchBar />
      <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alertas</h1>
            <p className="text-sm text-gray-500">Acompanhe alertas ativos, histórico, prioridade e status.</p>
          </div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm"><AlertTriangle size={18} /> {alertas.length} alertas</div>
        </div>

        {erro && <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-3 text-sm font-semibold">{erro}</div>}

        <form onSubmit={criarAlerta} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm grid grid-cols-1 lg:grid-cols-6 gap-3 items-end">
          <div className="lg:col-span-1">
            <label className="text-xs font-bold text-gray-600">Usuário</label>
            <input value={form.id_usuario || String(user?.id || "")} onChange={(e) => setForm({ ...form, id_usuario: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xs font-bold text-gray-600">Categoria</label>
            <input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600">Prioridade</label>
            <select value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
              <option value="1">Baixa</option>
              <option value="2">Média</option>
              <option value="3">Alta</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className="text-xs font-bold text-gray-600">Título</label>
            <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xs font-bold text-gray-600">Descrição</label>
            <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
          </div>
          <button disabled={criando} className="bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"><Plus size={16} /> Criar</button>
        </form>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
          <Filter size={16} className="text-gray-400" />
          <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
            <option value="">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="resolvido">Resolvidos</option>
          </select>
          <select value={prioridadeFiltro} onChange={(e) => setPrioridadeFiltro(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
            <option value="">Todas as prioridades</option>
            <option value="3">Alta</option>
            <option value="2">Média</option>
            <option value="1">Baixa</option>
          </select>
          <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
            <option value="">Todas as categorias</option>
            {categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
          </select>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {carregando ? (
            <div className="p-8 text-center text-sm text-gray-400">Carregando alertas...</div>
          ) : alertas.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">Nenhum alerta encontrado.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {alertas.map((alerta) => (
                <div key={alerta.id_alerta} className="p-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{alerta.titulo}</h3>
                      <span className={classePrioridade(Number(alerta.prioridade)) + " text-[10px] font-bold px-2 py-0.5 rounded-full"}>Prioridade {alerta.prioridade}</span>
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{alerta.categoria}</span>
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{alerta.status}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{alerta.descricao}</p>
                    <p className="text-xs text-gray-400 mt-2">Usuário #{alerta.id_usuario} • {alerta.data_criacao || alerta.data_envio ? new Date(alerta.data_criacao || alerta.data_envio || "").toLocaleString("pt-BR") : "Sem data"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {alerta.status !== "resolvido" && <button onClick={() => atualizarStatus(alerta.id_alerta, "resolvido")} className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"><CheckCircle size={16} /></button>}
                    {isAdmin && <button onClick={() => excluirAlerta(alerta.id_alerta)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={16} /></button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
