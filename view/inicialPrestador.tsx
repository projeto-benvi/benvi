"use client";

import { useState, useEffect, useContext } from "react";
import SearchBar from "@/components/searchBar";
import Link from "next/link";
import { AuthContext } from "@/app/context/AuthContext";

interface AgendaItem {
  id: string | number;
  hora: string;
  evento: string;
  local: string;
  status: "Concluido" | "Confirmado" | "Pendente" | "Cancelado";
}

interface ItemServico {
  id_servico: number;
  titulo: string;
  nome_usuario?: string;
  data_inicio?: string | Date;
  status_servico: string;
}

export default function InicialPrestador() {
  const { user, carregando } = useContext(AuthContext);
  const [agendaHoje, setAgendaHoje] = useState<AgendaItem[]>([]);
  const [servicosDoBanco, setServicosDoBanco] = useState<ItemServico[]>([]);
  const [mediaAvaliacoes, setMediaAvaliacoes] = useState(0);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [erro, setErro] = useState("");

  const statusColors: Record<AgendaItem["status"], string> = {
    Concluido: "bg-[#4ADE80]",
    Confirmado: "bg-[#2563EB]",
    Pendente: "bg-[#F97316]",
    Cancelado: "bg-red-500",
  };

  function normalizarStatusAgenda(status: string): AgendaItem["status"] {
    const valor = String(status || "").toLowerCase();
    if (valor === "concluido" || valor === "concluído") return "Concluido";
    if (valor === "confirmado") return "Confirmado";
    if (valor === "cancelado") return "Cancelado";
    return "Pendente";
  }

  function formatarHora(valor?: string | Date) {
    if (!valor) return "--:--";
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "--:--";
    return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function ehHoje(valor?: string | Date) {
    if (!valor) return false;
    const data = new Date(valor);
    const hoje = new Date();
    return data.getFullYear() === hoje.getFullYear() && data.getMonth() === hoje.getMonth() && data.getDate() === hoje.getDate();
  }

  async function carregarResumoPrestador() {
    if (!user?.id) return;

    try {
      setCarregandoDados(true);
      setErro("");
      const idPrestador = Number(user.id);
      const responses = await Promise.all([
        fetch("/api/servico?id_prestador=" + idPrestador, { cache: "no-store" }),
        fetch("/api/agenda?id_prestador=" + idPrestador, { cache: "no-store" }),
        fetch("/api/avaliacoes/prestador/" + idPrestador, { cache: "no-store" }),
      ]);

      const servicos = responses[0].ok ? await responses[0].json() : [];
      const agenda = responses[1].ok ? await responses[1].json() : [];
      const avaliacoes = responses[2].ok ? await responses[2].json() : [];

      const listaServicos = Array.isArray(servicos) ? servicos : [];
      setServicosDoBanco(listaServicos.slice(0, 5));

      const agendaNormalizada = (Array.isArray(agenda) ? agenda : [])
        .filter((item: any) => ehHoje(item.horario_inicio))
        .map((item: any) => ({
          id: item.id_agenda,
          hora: formatarHora(item.horario_inicio),
          evento: item.titulo || item.descricao_servico || "Agendamento",
          local: item.endereco || item.nome_usuario || "Sem cliente vinculado",
          status: normalizarStatusAgenda(item.status),
        }));
      setAgendaHoje(agendaNormalizada);

      const listaAvaliacoes = Array.isArray(avaliacoes) ? avaliacoes : [];
      const media = listaAvaliacoes.length
        ? listaAvaliacoes.reduce((soma: number, item: any) => soma + Number(item.nota || 0), 0) / listaAvaliacoes.length
        : 0;
      setMediaAvaliacoes(media);
    } catch (error) {
      console.error("Erro ao carregar resumo do prestador:", error);
      setErro("Não foi possível carregar seus dados agora.");
    } finally {
      setCarregandoDados(false);
    }
  }

  useEffect(() => {
    carregarResumoPrestador();
  }, [user?.id]);

  const nomePrestador = user?.nome || (user as any)?.name || "Prestador";
  const servicosConcluidos = servicosDoBanco.filter((servico) => String(servico.status_servico).toLowerCase().includes("conclu")).length;

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen antialiased text-gray-800 w-full">
      <div className="flex-1 flex flex-col min-w-0">
        <SearchBar />
        <main className="flex-1 p-8 flex gap-8 overflow-y-auto">
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Olá, {carregando ? "..." : nomePrestador}</h1>
              <p className="text-sm text-gray-500 mt-1">Aqui está um resumo de suas atividades</p>
              {erro && <p className="text-xs text-red-500 font-semibold mt-2">{erro}</p>}
            </div>

            <div className="grid grid-cols-3 gap-5">
              <ResumoCard icone="📅" titulo="Agendamentos hoje" valor={carregandoDados ? "..." : String(agendaHoje.length)} href="/agendaPrestador" textoLink="Ver agenda ➔" />
              <ResumoCard icone="⭐" titulo="Avaliação média" valor={carregandoDados ? "..." : mediaAvaliacoes ? mediaAvaliacoes.toFixed(1) : "--"} href="/avaliacoes" textoLink="Ver avaliações ➔" />
              <ResumoCard icone="📋" titulo="Serviços concluídos" valor={carregandoDados ? "..." : String(servicosConcluidos)} href="/servicoPrestador" textoLink="Ver todos ➔" />
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 flex-1 flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-900">Serviços recentes</h2>
                <Link href="/servicoPrestador" className="cursor-pointer text-xs text-blue-600 font-bold hover:underline">Ver todos</Link>
              </div>
              <div className="flex flex-col gap-3">
                {carregandoDados ? (
                  <div className="text-xs text-gray-400 text-center py-4">Carregando serviços...</div>
                ) : servicosDoBanco.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-4">Nenhum serviço recente.</div>
                ) : (
                  servicosDoBanco.map((servico) => {
                    const concluido = String(servico.status_servico).toLowerCase().includes("conclu");
                    return (
                      <div key={servico.id_servico} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 bg-gray-200 rounded-lg shrink-0 flex items-center justify-center text-xs text-gray-400 font-semibold">Foto</div>
                          <div className="flex flex-col">
                            <h4 className="text-xs font-bold text-gray-900">{servico.titulo}</h4>
                            <p className="text-[11px] text-gray-500 mt-0.5">{servico.nome_usuario || "Cliente"}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{servico.data_inicio ? new Date(servico.data_inicio).toLocaleDateString("pt-BR") : "Sem data"}</p>
                          </div>
                        </div>
                        <span className={(concluido ? "bg-[#ECFDF5] text-[#10B981]" : "bg-[#FDF4E9] text-[#F97316]") + " text-[10px] font-bold px-3 py-1 rounded-md shadow-xs"}>{servico.status_servico}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="w-[360px] bg-white border border-gray-100 rounded-2xl p-6 flex flex-col shadow-sm shrink-0 h-[520px]">
            <h2 className="text-base font-bold text-gray-900 mb-6">Agenda de hoje</h2>
            {carregandoDados ? (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-400">Carregando agenda...</div>
            ) : agendaHoje.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-400">Nenhum compromisso para hoje.</div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 relative flex flex-col gap-6 pl-4 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {agendaHoje.map((item) => (
                  <div key={item.id} className="flex gap-4 relative items-start">
                    <span className={(statusColors[item.status] || "bg-gray-300") + " w-2.5 h-2.5 rounded-full mt-1.5 z-10 ring-4 ring-white shrink-0"} />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-xs font-bold text-gray-900 shrink-0">{item.hora}</span><h3 className="text-xs font-bold text-gray-800 truncate">{item.evento}</h3></div>
                      <p className="text-[11px] text-gray-400 truncate">{item.local}</p>
                      <div className="mt-1"><span className={(statusColors[item.status] || "bg-gray-300") + " text-[10px] font-bold px-2.5 py-0.5 rounded-md text-white shadow-xs"}>{item.status}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/agendaPrestador" className="cursor-pointer w-full text-center text-xs text-blue-600 font-bold border-t border-gray-100 pt-4 mt-4 hover:underline inline-flex justify-center items-center gap-1 shrink-0">Ver agenda completa ➔</Link>
          </div>
        </main>
      </div>
    </div>
  );
}

function ResumoCard({ icone, titulo, valor, href, textoLink }: { icone: string; titulo: string; valor: string; href: string; textoLink: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition">
      <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100 text-2xl">{icone}</div>
      <span className="text-xs font-bold text-gray-500">{titulo}</span>
      <span className="text-xl font-bold text-gray-900 mt-1">{valor}</span>
      <Link href={href} className="cursor-pointer text-xs text-blue-600 font-bold mt-2 inline-flex items-center gap-1 hover:underline">{textoLink}</Link>
    </div>
  );
}
