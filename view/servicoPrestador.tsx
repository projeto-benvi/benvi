"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import SearchBar from "@/components/searchBar";

import {
  Plus,
  Clock,
  Users,
  Check,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
  ShieldCheck,
  Info,
  Upload,
} from "lucide-react";

interface ServicoRetorno {
  id_servico: number;
  id_usuario?: number;
  id_solicitacao?: number;
  id_prestador?: number;
  id_categoria?: number;
  nome_categoria?: string;
  titulo: string;
  descricao: string;
  status_servico: string;
  data_inicio?: string | Date;
  data_fim?: string | Date;
  tempo_execucao?: string;
  imagens?: string | string[];
}

interface CategoriaRetorno {
  id_categoria: number;
  nome_categoria: string;
  descricao?: string;
}

interface SolicitacaoRetorno {
  id_solicitacao: number;
  id_usuario?: number;
  id_prestador?: number;
  endereco?: string;
  data_solicitacao: string | Date;
  data_agendamento?: string | Date;
  status: boolean | number | string;
  descricao_servico?: string;
  complemento: string;
  nome_usuario?: string;
}

type TipoAlerta = "success" | "error";

export default function ServicoPrestador() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const usuarioSessao = session?.user as any;

  const nomeUsuario = usuarioSessao?.name || "Prestador";
  const idUsuarioLogado = usuarioSessao?.id;
  const isPrestador = usuarioSessao?.isPrestador === true;

  const [activeFilter, setActiveFilter] = useState<
    "Todos" | "Concluidos" | "Pendente" | "Solicitacoes"
  >("Todos");

  const [services, setServices] = useState<ServicoRetorno[]>([]);
  const [categorias, setCategorias] = useState<CategoriaRetorno[]>([]);
  const categoriasDisponiveis = categorias.map((cat) => cat.nome_categoria);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoRetorno[]>([]);

  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  const [loading, setLoading] = useState(true);
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
  const [salvandoServico, setSalvandoServico] = useState(false);

  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novoTempo, setNovoTempo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novasFotos, setNovasFotos] = useState<File[]>([]);

  const [errosNovoServico, setErrosNovoServico] = useState<
    Record<string, string>
  >({});

  const [solicitacaoParaRecusar, setSolicitacaoParaRecusar] =
    useState<SolicitacaoRetorno | null>(null);
  const [solicitacaoEmDetalhe, setSolicitacaoEmDetalhe] =
    useState<SolicitacaoRetorno | null>(null);

  const [servicoParaAvaliar, setServicoParaAvaliar] =
    useState<ServicoRetorno | null>(null);
  const [servicoEmDetalhe, setServicoEmDetalhe] =
    useState<ServicoRetorno | null>(null);

  const [notaGeral, setNotaGeral] = useState(5);
  const [comentario, setComentario] = useState("");

  const [notasCriterios, setNotasCriterios] = useState({
    comunicacao: 5,
    respeito: 5,
    pontualidade: 5,
    acordo: 5,
  });

  const [alertConfig, setAlertConfig] = useState<{
    visivel: boolean;
    mensagem: string;
    tipo: TipoAlerta;
  }>({
    visivel: false,
    mensagem: "",
    tipo: "success",
  });

  function dispararAlerta(mensagem: string, tipo: TipoAlerta = "success") {
    setAlertConfig({
      visivel: true,
      mensagem,
      tipo,
    });

    setTimeout(() => {
      setAlertConfig((prev) => ({
        ...prev,
        visivel: false,
      }));
    }, 3500);
  }

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && !isPrestador) {
      router.push("/");
    }
  }, [status, isPrestador, router]);

  async function carregarDadosDoBanco() {
    if (!idUsuarioLogado) return;

    try {
      setLoading(true);

      const [resServicos, resCategorias, resSolicitacoes] = await Promise.all([
  fetch(`/api/servico?id_prestador=${idUsuarioLogado}`, {
    cache: "no-store",
  }),
  fetch("/api/categoria", {
    cache: "no-store",
  }),
  fetch(`/api/solicitacaoservico?id_prestador=${idUsuarioLogado}`, {
    cache: "no-store",
  }),
]);

      if (resServicos.ok) {
        const dadosServicos = await resServicos.json();
        const listaServicos = Array.isArray(dadosServicos)
          ? dadosServicos
          : Array.isArray(dadosServicos?.dados)
            ? dadosServicos.dados
            : [];

        {
          const listaFiltrada = listaServicos.filter(
            (servico: ServicoRetorno) => {
              if (!servico.id_prestador) return true;
              return Number(servico.id_prestador) === Number(idUsuarioLogado);
            }
          );

          setServices(listaFiltrada);
        }
      }

      if (resCategorias.ok) {
        const dadosCategorias = await resCategorias.json();

        if (Array.isArray(dadosCategorias)) {
          setCategorias(dadosCategorias);
        }
      }

      if (resSolicitacoes.ok) {
        const dadosSolicitacoes = await resSolicitacoes.json();
        const listaSolicitacoes = Array.isArray(dadosSolicitacoes)
          ? dadosSolicitacoes
          : Array.isArray(dadosSolicitacoes?.dados)
            ? dadosSolicitacoes.dados
            : [];

        setSolicitacoes(listaSolicitacoes);
      }
    } catch (error) {
      console.error("Erro ao conectar com o banco de dados:", error);
      dispararAlerta("Erro de rede ao carregar os dados.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated" && isPrestador && idUsuarioLogado) {
      carregarDadosDoBanco();
    }
  }, [status, isPrestador, idUsuarioLogado]);

  const solicitacoesPendentes = useMemo(() => {
    return solicitacoes.filter((solicitacao) => {
      const statusSolicitacao = String(solicitacao.status).toLowerCase();

      return (
        solicitacao.status === false ||
        solicitacao.status === 0 ||
        statusSolicitacao === "pendente"
      );
    });
  }, [solicitacoes]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const statusServico = String(service.status_servico || "").toLowerCase();

      let matchesStatus = true;

      if (activeFilter === "Concluidos") {
        matchesStatus =
          statusServico === "concluido" || statusServico === "concluído";
      }

      if (activeFilter === "Pendente") {
        matchesStatus =
          statusServico === "pendente" ||
          statusServico === "ativo" ||
          statusServico === "em andamento";
      }

      let matchesCategory = true;

      if (activeCategory !== "Todos") {
        const categoriaServico =
          service.nome_categoria || buscarNomeCategoriaPorId(service.id_categoria);

        matchesCategory =
          categoriaServico?.toLowerCase() === activeCategory.toLowerCase();
      }

      return matchesStatus && matchesCategory;
    });
  }, [services, activeFilter, activeCategory]);

  function buscarNomeCategoriaPorId(id_categoria?: number) {
    if (!id_categoria) return "";

    const categoria = categorias.find(
      (cat) => Number(cat.id_categoria) === Number(id_categoria)
    );

    return categoria?.nome_categoria || "";
  }

  function limparFormularioNovoServico() {
    setNovoTitulo("");
    setNovaCategoria("");
    setNovoTempo("");
    setNovaDescricao("");
    setNovasFotos([]);
    setErrosNovoServico({});
  }

  function validarNovoServico() {
    const novosErros: Record<string, string> = {};

    if (!novoTitulo.trim()) {
      novosErros.titulo = "Informe o nome do serviço.";
    }

    if (!novaCategoria) {
      novosErros.categoria = "Selecione uma categoria.";
    }

    if (!novoTempo.trim()) {
      novosErros.tempo = "Informe o tempo médio de execução.";
    }

    if (novaDescricao.trim().length > 500) {
      novosErros.descricao = "A descrição deve ter no máximo 500 caracteres.";
    }

    setErrosNovoServico(novosErros);

    return Object.keys(novosErros).length === 0;
  }

  async function adicionarServico(e: React.FormEvent) {
    e.preventDefault();

    if (!validarNovoServico()) return;

    if (!idUsuarioLogado) {
      dispararAlerta("Usuário logado não encontrado.", "error");
      return;
    }

    try {
      setSalvandoServico(true);

      const categoriaDoBanco = categorias.find(
        (cat) =>
          cat.nome_categoria.toLowerCase() === novaCategoria.toLowerCase()
      );

      const payload = {
        id_prestador: Number(idUsuarioLogado),
        id_categoria: categoriaDoBanco?.id_categoria || null,
        nome_categoria: novaCategoria,
        titulo: novoTitulo.trim(),
        descricao:
          novaDescricao.trim() || "Serviço cadastrado pelo prestador.",
        tempo_execucao: novoTempo.trim(),
        status_servico: "pendente",
      };

      const response = await fetch("/api/servico", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        dispararAlerta(
          data?.erro ||
            data?.error ||
            data?.mensagem ||
            "Não foi possível adicionar o serviço.",
          "error"
        );
        return;
      }

      const novoServico: ServicoRetorno = {
        id_servico: data?.id_servico || data?.id || Date.now(),
        id_prestador: Number(idUsuarioLogado),
        id_categoria: categoriaDoBanco?.id_categoria,
        nome_categoria: novaCategoria,
        titulo: novoTitulo.trim(),
        descricao:
          novaDescricao.trim() || "Serviço cadastrado pelo prestador.",
        tempo_execucao: novoTempo.trim(),
        status_servico: data?.status_servico || "pendente",
        imagens: data?.imagens || [],
      };

      setServices((prev) => [novoServico, ...prev]);

      setModalAdicionarAberto(false);
      limparFormularioNovoServico();

      dispararAlerta("Serviço adicionado com sucesso!", "success");
    } catch (error) {
      console.error(error);
      dispararAlerta("Erro de conexão ao adicionar serviço.", "error");
    } finally {
      setSalvandoServico(false);
    }
  }

  async function aceitarSolicitacao(solicitacao: SolicitacaoRetorno) {
    try {
      const idPrestadorServico = Number(
        solicitacao.id_prestador || idUsuarioLogado
      );

      if (!Number.isInteger(idPrestadorServico) || idPrestadorServico <= 0) {
        dispararAlerta(
          "Não foi possível identificar o prestador desta solicitação.",
          "error"
        );
        return;
      }

      const tituloServico = solicitacao.nome_usuario
        ? `Serviço para ${solicitacao.nome_usuario}`
        : "Serviço solicitado";

      const servicoResponse = await fetch("/api/servico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_prestador: idPrestadorServico,
          id_categoria: null,
          titulo: tituloServico,
          descricao:
            solicitacao.descricao_servico ||
            solicitacao.complemento ||
            "Serviço solicitado pelo cliente.",
          tempo_execucao: "30 a 60 min",
          status_servico: "pendente",
          data_inicio:
            solicitacao.data_agendamento || new Date().toISOString(),
        }),
      });

      const dadosServico = await servicoResponse.json().catch(() => ({}));

      if (!servicoResponse.ok) {
        throw new Error(
          dadosServico?.detalhes ||
            dadosServico?.erro ||
            dadosServico?.error ||
            "Não foi possível criar o serviço."
        );
      }

      const response = await fetch(
        `/api/solicitacaoservico/${solicitacao.id_solicitacao}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: 1,
          }),
        }
      );

      if (!response.ok) {
        const dadosSolicitacao = await response.json().catch(() => ({}));
        throw new Error(
          dadosSolicitacao?.detalhes ||
            dadosSolicitacao?.erro ||
            dadosSolicitacao?.error ||
            "Serviço criado, mas não foi possível atualizar a solicitação."
        );
      }

      if (solicitacao.data_agendamento) {
        const inicio = new Date(solicitacao.data_agendamento);
        const fim = new Date(inicio.getTime() + 60 * 60 * 1000);

        await fetch("/api/agenda", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_prestador: idPrestadorServico,
            id_solicitacao: solicitacao.id_solicitacao,
            horario_inicio: inicio.toISOString(),
            horario_fim: fim.toISOString(),
            status: "pendente",
            titulo: tituloServico,
            descricao:
              solicitacao.descricao_servico ||
              solicitacao.complemento ||
              "Agendamento criado a partir da solicitação.",
          }),
        });
      }

      setSolicitacoes((prev) =>
        prev.filter(
          (item) => item.id_solicitacao !== solicitacao.id_solicitacao
        )
      );

      const novoServicoPendente: ServicoRetorno = {
        id_servico:
          dadosServico?.id_servico ||
          dadosServico?.id ||
          solicitacao.id_solicitacao,
        id_usuario: solicitacao.id_usuario,
        id_solicitacao: solicitacao.id_solicitacao,
        id_prestador: idPrestadorServico,
        titulo: tituloServico,
        descricao: solicitacao.descricao_servico || "Sem descrição fornecida",
        status_servico: "pendente",
        tempo_execucao: "30 a 60 min",
        data_inicio: solicitacao.data_agendamento,
      };

      setServices((prev) => [novoServicoPendente, ...prev]);

      dispararAlerta(
        "Solicitação aceita e salva em serviços pendentes!",
        "success"
      );
    } catch (error) {
      console.error(error);
      dispararAlerta(
        error instanceof Error
          ? error.message
          : "Erro de conexão ao aceitar solicitação.",
        "error"
      );
    }
  }

  async function confirmarRecusarSolicitacao() {
    if (!solicitacaoParaRecusar) return;

    try {
      const response = await fetch(
        `/api/solicitacaoservico/${solicitacaoParaRecusar.id_solicitacao}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setSolicitacoes((prev) =>
          prev.filter(
            (item) =>
              item.id_solicitacao !== solicitacaoParaRecusar.id_solicitacao
          )
        );

        setSolicitacaoParaRecusar(null);
        dispararAlerta("Solicitação recusada com sucesso.", "success");
      } else {
        dispararAlerta("Erro ao recusar a solicitação no servidor.", "error");
      }
    } catch (error) {
      console.error(error);
      dispararAlerta("Erro de rede ao recusar solicitação.", "error");
    }
  }

  async function concluirServico(id_servico: number) {
    try {
      const response = await fetch(`/api/servico/${id_servico}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status_servico: "concluido",
        }),
      });

      if (response.ok) {
        setServices((prev) =>
          prev.map((service) =>
            service.id_servico === id_servico
              ? {
                  ...service,
                  status_servico: "concluido",
                }
              : service
          )
        );

        dispararAlerta("Serviço concluído com sucesso!", "success");
      } else {
        dispararAlerta("Falha ao atualizar o status do serviço.", "error");
      }
    } catch (error) {
      console.error(error);
      dispararAlerta("Erro de rede ao concluir o serviço.", "error");
    }
  }

  async function enviarAvaliacao() {
    if (!servicoParaAvaliar) return;

    try {
      const solicitacaoCorrespondente = solicitacoes.find((sol) => {
        const idSolicitacaoServico = Number(servicoParaAvaliar.id_solicitacao);
        const idServico = Number(servicoParaAvaliar.id_servico);
        const mesmaSolicitacao =
          Number(sol.id_solicitacao) === idSolicitacaoServico ||
          Number(sol.id_solicitacao) === idServico;
        const mesmoTexto =
          Boolean(servicoParaAvaliar.descricao) &&
          (sol.descricao_servico === servicoParaAvaliar.descricao ||
            sol.complemento === servicoParaAvaliar.descricao);

        return mesmaSolicitacao || mesmoTexto;
      });

      const idUsuarioCliente =
        servicoParaAvaliar.id_usuario ||
        solicitacaoCorrespondente?.id_usuario;

      if (!idUsuarioCliente) {
        dispararAlerta(
          "Não foi possível localizar o cliente para vincular a avaliação.",
          "error"
        );
        return;
      }

      const dadosParaEnviar = {
        id_usuario: Number(idUsuarioCliente),
        id_prestador: Number(idUsuarioLogado),
        id_servico: Number(servicoParaAvaliar.id_servico),
        nota_geral: Number(notaGeral),
        comentario: comentario.trim(),
        comunicacao: Number(notasCriterios.comunicacao),
        respeito: Number(notasCriterios.respeito),
        pontualidade: Number(notasCriterios.pontualidade),
        acordo: Number(notasCriterios.acordo),
      };

      const response = await fetch(`/api/avaliacoes/${idUsuarioCliente}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosParaEnviar),
      });

      if (!response.ok) {
        const dadosErro = await response.json().catch(() => ({}));

        dispararAlerta(
          dadosErro.error ||
            dadosErro.mensagem ||
            "Erro ao salvar a avaliação.",
          "error"
        );

        return;
      }

      dispararAlerta("Avaliação enviada com sucesso!", "success");

      setServicoParaAvaliar(null);
      setNotaGeral(5);
      setComentario("");
      setNotasCriterios({
        comunicacao: 5,
        respeito: 5,
        pontualidade: 5,
        acordo: 5,
      });
    } catch (error) {
      console.error(error);
      dispararAlerta("Erro de rede ao enviar avaliação.", "error");
    }
  }

  function RenderEstrelasClicaveis({
    valorAtual,
    onChange,
  }: {
    valorAtual: number;
    onChange: (v: number) => void;
  }) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((estrela) => (
          <button
            key={estrela}
            type="button"
            onClick={() => onChange(estrela)}
            className="cursor-pointer transition-transform hover:scale-110"
          >
            <Star
              size={22}
              className={
                estrela <= valorAtual
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              }
            />
          </button>
        ))}
      </div>
    );
  }

  function contarCategoria(categoria: string) {
    return services.filter((servico) => {
      const nome =
        servico.nome_categoria || buscarNomeCategoriaPorId(servico.id_categoria);

      return nome?.toLowerCase() === categoria.toLowerCase();
    }).length;
  }

  function formatarData(valor?: string | Date, incluirHora = false) {
    if (!valor) return "Não informado";

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) return "Não informado";

    if (incluirHora) {
      return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return data.toLocaleDateString("pt-BR");
  }

  function statusSolicitacaoLabel(statusSolicitacao: SolicitacaoRetorno["status"]) {
    const normalizado = String(statusSolicitacao).toLowerCase();

    if (
      statusSolicitacao === false ||
      statusSolicitacao === 0 ||
      normalizado === "pendente"
    ) {
      return "Pendente";
    }

    if (statusSolicitacao === true || statusSolicitacao === 1 || normalizado === "aceito") {
      return "Aceito";
    }

    return "Atualizado";
  }

  function obterPrimeiraImagemServico(service: ServicoRetorno): string | null {
    const valor = service.imagens;

    if (!valor) return null;

    if (Array.isArray(valor)) {
      return (valor.find((item) => typeof item === "string" && item.trim()) as string) || null;
    }

    if (typeof valor === "string") {
      const valorLimpo = valor.trim();
      if (!valorLimpo) return null;

      try {
        const parsed = JSON.parse(valorLimpo);
        if (Array.isArray(parsed)) {
          return (parsed.find((item) => typeof item === "string" && item.trim()) as string) || null;
        }

        if (typeof parsed === "string" && parsed.trim()) {
          return parsed;
        }
      } catch {
        return valorLimpo;
      }

      return null;
    }

    return null;
  }

  function obterImagensServico(service: ServicoRetorno): string[] {
    const valor = service.imagens;

    if (!valor) return [];

    if (Array.isArray(valor)) {
      return valor.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
    }

    if (typeof valor === "string") {
      const valorLimpo = valor.trim();
      if (!valorLimpo) return [];

      try {
        const parsed = JSON.parse(valorLimpo);

        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
        }

        if (typeof parsed === "string" && parsed.trim()) {
          return [parsed];
        }
      } catch {
        return [valorLimpo];
      }
    }

    return [];
  }

  if (status === "loading") {
    return (
      <div className="min-h-[100dvh] bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-sm text-gray-400">Verificando acesso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] flex flex-col font-sans text-gray-800 relative">
      <SearchBar />

      <div className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex gap-6 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start pb-4 shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-[#0B1B4D]">
                {activeFilter === "Solicitacoes"
                  ? "Solicitações Recebidas"
                  : "Meus Serviços"}
              </h1>

              <p className="text-xs text-gray-500 mt-1">
                Gerencie os serviços que você oferece
              </p>
            </div>

            <button
              onClick={() => setModalAdicionarAberto(true)}
              className="w-full sm:w-auto justify-center bg-[#2563EB] hover:bg-[#1D4ED8] transition text-white px-5 sm:px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus size={18} />
              Adicionar Serviços
            </button>
          </div>

          <div className="flex gap-2 sm:gap-3 pb-6 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveFilter("Todos")}
              className={`min-w-[105px] px-6 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer ${
                activeFilter === "Todos"
                  ? "bg-[#DCE7FF] text-[#1D4ED8] border-transparent"
                  : "bg-white text-[#0B1B4D] border-gray-200 hover:bg-gray-50"
              }`}
            >
              Todos
            </button>

            <button
              onClick={() => setActiveFilter("Concluidos")}
              className={`min-w-[120px] px-6 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer ${
                activeFilter === "Concluidos"
                  ? "bg-[#DCE7FF] text-[#1D4ED8] border-transparent"
                  : "bg-white text-[#0B1B4D] border-gray-200 hover:bg-gray-50"
              }`}
            >
              Concluídos
            </button>

            <button
              onClick={() => setActiveFilter("Pendente")}
              className={`min-w-[120px] px-6 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer ${
                activeFilter === "Pendente"
                  ? "bg-[#DCE7FF] text-[#1D4ED8] border-transparent"
                  : "bg-white text-[#0B1B4D] border-gray-200 hover:bg-gray-50"
              }`}
            >
              Pendente
            </button>

            <button
              onClick={() => setActiveFilter("Solicitacoes")}
              className={`min-w-[130px] px-6 py-2.5 rounded-xl text-sm font-semibold border relative cursor-pointer ${
                activeFilter === "Solicitacoes"
                  ? "bg-[#DCE7FF] text-[#1D4ED8] border-transparent"
                  : "bg-white text-[#0B1B4D] border-gray-200 hover:bg-gray-50"
              }`}
            >
              Solicitações

              {solicitacoesPendentes.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#F4B7B7] border border-[#7F1D1D] text-[#7F1D1D] text-[11px] w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  {solicitacoesPendentes.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="text-xs text-gray-400 text-center py-12">
                Carregando dados...
              </div>
            ) : activeFilter === "Solicitacoes" ? (
              solicitacoesPendentes.length === 0 ? (
                <div className="text-xs text-gray-400 text-center py-12">
                  Nenhuma solicitação pendente.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {solicitacoesPendentes.map((solicitacao) => (
                    <div
                      key={solicitacao.id_solicitacao}
                      onClick={() => setSolicitacaoEmDetalhe(solicitacao)}
                    className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white hover:bg-[#F8FAFC] transition cursor-pointer"
                    >
                      <div className="flex min-w-0 gap-3 sm:gap-4 items-center flex-1">
                        <div className="w-16 h-16 sm:w-[104px] sm:h-[82px] shrink-0 bg-[#EAF2FF] text-[#2563EB] rounded-xl flex items-center justify-center font-bold text-xl uppercase">
                          {(solicitacao.nome_usuario || "C")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="space-y-1 flex-1">
                          <h3 className="font-bold text-[#0B1B4D] text-sm">
                            {solicitacao.nome_usuario || "Cliente"}
                          </h3>

                          <p className="text-xs text-gray-500 max-w-xl line-clamp-2">
                            {solicitacao.descricao_servico ||
                              "Solicitação sem descrição."}
                          </p>

                          <p className="text-[11px] text-gray-500 max-w-xl line-clamp-1">
                            Endereço: {solicitacao.endereco || "Não informado"}
                          </p>

                          <div className="flex gap-5 pt-2 text-[11px] text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock size={13} />
                              Agendado para {formatarData(solicitacao.data_agendamento)}
                            </span>
                            <span>{statusSolicitacaoLabel(solicitacao.status)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full gap-2 sm:w-auto sm:min-w-[210px] justify-end">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setSolicitacaoParaRecusar(solicitacao);
                          }}
                          className="flex items-center gap-1 px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl cursor-pointer"
                        >
                          <Trash2 size={14} />
                          Recusar
                        </button>

                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            aceitarSolicitacao(solicitacao);
                          }}
                          className="flex items-center gap-1 px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          <Check size={14} />
                          Aceitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : filteredServices.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-12">
                Nenhum serviço para exibir.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredServices.map((service) => {
                  const statusLower = String(
                    service.status_servico || ""
                  ).toLowerCase();
                  const imagemCapa = obterPrimeiraImagemServico(service);

                  const isPendente =
                    statusLower === "pendente" ||
                    statusLower === "ativo" ||
                    statusLower === "em andamento";

                  const isConcluido =
                    statusLower === "concluido" ||
                    statusLower === "concluído";

                  return (
                    <div
                      key={service.id_servico}
                      onClick={() => setServicoEmDetalhe(service)}
                      className="px-4 py-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white hover:bg-[#F8FAFC] transition cursor-pointer"
                    >
                      <div className="flex gap-4 items-center flex-1 min-w-0">
                        <div className="w-16 h-16 sm:w-[104px] sm:h-[82px] bg-[#E5E7EB] rounded-xl shrink-0 flex items-center justify-center text-[10px] text-gray-400 font-semibold overflow-hidden">
                          {imagemCapa ? (
                            <img
                              src={imagemCapa}
                              alt={service.titulo}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>Foto</span>
                          )}
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <h3 className="font-bold text-[#0B1B4D] text-sm truncate">
                            {service.titulo}
                          </h3>

                          <p className="text-xs text-gray-500 max-w-xl line-clamp-1">
                            {service.descricao}
                          </p>

                          <div className="flex gap-6 pt-3 text-[11px] text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock size={13} />
                              {service.tempo_execucao || "30 a 60 min"}
                            </span>

                            <span className="flex items-center gap-1">
                              <Users size={13} />
                              Muito procurado
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full items-center gap-4 shrink-0 sm:w-auto">
                        <div className="flex w-full flex-row items-center justify-between sm:h-20 sm:min-w-[120px] sm:flex-col sm:items-end">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              isPendente
                                ? "bg-[#FDF4E9] text-[#F97316]"
                                : "bg-[#ECFDF5] text-[#10B981]"
                            }`}
                          >
                            {isPendente ? "Pendente" : "concluído"}
                          </span>

                          {isPendente ? (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                concluirServico(service.id_servico);
                              }}
                              className="bg-[#2563EB] text-white text-xs font-bold px-6 py-2 rounded-xl w-full text-center cursor-pointer"
                            >
                              Concluir
                            </button>
                          ) : (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                setServicoParaAvaliar(service);
                              }}
                              className="bg-[#F97316] text-white text-xs font-bold px-6 py-2 rounded-xl w-full text-center cursor-pointer hover:bg-[#EA580C] transition"
                            >
                              Avaliar
                            </button>
                          )}

                          {isConcluido && (
                            <div className="flex gap-0.5 text-amber-400 text-[10px]">
                              ★★★★★
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="w-80 space-y-6 shrink-0 hidden lg:flex flex-col pt-[83px]">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h4 className="font-bold text-[#0B1B4D] text-sm mb-4">
              Dicas para seus serviços
            </h4>

            <div className="bg-[#EAF2FF] border border-[#BFDBFE] rounded-xl p-3 flex gap-3 items-start mb-4">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#DBEAFE] text-[#2563EB] shrink-0">
                <Info size={15} />
              </div>

              <p className="text-[11px] text-[#1E3A8A] leading-snug font-medium">
                Serviços bem descritos e com fotos reais recebem até{" "}
                <strong>3x mais solicitações!</strong>
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Adicione fotos de qualidade",
                "Descrição clara do serviço",
                "Mantenha seus serviços atualizados",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs text-gray-600"
                >
                  <span className="w-4 h-4 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-[10px]">
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h4 className="font-bold text-[#0B1B4D] text-sm mb-4">
              Categorias
            </h4>

            <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
              <button
                onClick={() => setActiveCategory("Todos")}
                className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-xs font-bold ${
                  activeCategory === "Todos"
                    ? "bg-[#DCE7FF] text-[#1D4ED8]"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span>Todos os serviços</span>
                <span>{services.length}</span>
              </button>

              {categoriasDisponiveis.map((categoria) => (
                <button
                  key={categoria}
                  onClick={() => setActiveCategory(categoria)}
                  className={`w-full flex justify-between items-center px-3 py-2 text-xs rounded-lg ${
                    activeCategory === categoria
                      ? "bg-[#DCE7FF] text-[#1D4ED8] font-bold"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-left">{categoria}</span>
                  <span>{contarCategoria(categoria)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalAdicionarAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <form
            onSubmit={adicionarServico}
            className="bg-white rounded-xl w-full max-w-[520px] shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-start justify-between px-7 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-base font-bold text-[#0B1B4D]">
                  Adicionar Serviço
                </h2>

                <p className="text-[10px] text-gray-500 mt-0.5">
                  Preencha as informações para cadastrar um novo serviço.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalAdicionarAberto(false);
                  limparFormularioNovoServico();
                }}
                className="text-gray-500 hover:text-gray-800 font-bold"
              >
                X
              </button>
            </div>

            <div className="px-7 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
              <div>
                <h3 className="text-base font-bold text-[#0B1B4D] mb-3">
                  1. Informações básicas
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700">
                      Nome do serviço <span className="text-red-500">*</span>
                    </label>

                    <input
                      value={novoTitulo}
                      onChange={(e) => {
                        setNovoTitulo(e.target.value);
                        setErrosNovoServico((prev) => ({
                          ...prev,
                          titulo: "",
                        }));
                      }}
                      placeholder="Ex: Instalação de torneira"
                      className={`mt-1 w-full h-10 border rounded-lg px-3 text-xs outline-none focus:border-[#2563EB] ${
                        errosNovoServico.titulo
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    />

                    {errosNovoServico.titulo && (
                      <p className="text-[10px] text-red-500 mt-1">
                        {errosNovoServico.titulo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-700">
                      Categoria <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={novaCategoria}
                      onChange={(e) => {
                        setNovaCategoria(e.target.value);
                        setErrosNovoServico((prev) => ({
                          ...prev,
                          categoria: "",
                        }));
                      }}
                      className={`mt-1 w-full h-10 border rounded-lg px-3 text-xs outline-none focus:border-[#2563EB] bg-white ${
                        errosNovoServico.categoria
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    >
                      <option value="">Selecione a categoria</option>

                      {categoriasDisponiveis.map((categoria) => (
                        <option key={categoria} value={categoria}>
                          {categoria}
                        </option>
                      ))}
                    </select>

                    {errosNovoServico.categoria && (
                      <p className="text-[10px] text-red-500 mt-1">
                        {errosNovoServico.categoria}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-700">
                      Tempo médio de execução{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      value={novoTempo}
                      onChange={(e) => {
                        setNovoTempo(e.target.value);
                        setErrosNovoServico((prev) => ({
                          ...prev,
                          tempo: "",
                        }));
                      }}
                      placeholder="Ex: 1h 30min"
                      className={`mt-1 w-full h-10 border rounded-lg px-3 text-xs outline-none focus:border-[#2563EB] ${
                        errosNovoServico.tempo
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    />

                    {errosNovoServico.tempo && (
                      <p className="text-[10px] text-red-500 mt-1">
                        {errosNovoServico.tempo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-700">
                      Descrição do serviço opcional
                    </label>

                    <textarea
                      value={novaDescricao}
                      onChange={(e) =>
                        setNovaDescricao(e.target.value.slice(0, 500))
                      }
                      rows={5}
                      placeholder="Descreva seus serviços, experiência e diferenciais..."
                      className="mt-1 w-full border border-gray-200 rounded-lg p-3 text-xs outline-none resize-none focus:border-[#2563EB]"
                    />

                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-red-500">
                        {errosNovoServico.descricao}
                      </span>

                      <span className="text-[10px] text-gray-400">
                        {novaDescricao.length}/500
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#0B1B4D] mb-3">
                  2. Detalhes adicionais
                </h3>

                <label className="text-[11px] font-semibold text-gray-700">
                  Fotos do serviço opcional
                </label>

                <label className="mt-1 h-[64px] border border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition">
                  <Upload size={16} className="text-gray-500 mb-1" />

                  <span className="text-[10px] text-gray-600">
                    Clique para adicionar fotos ou arraste aqui
                  </span>

                  <span className="text-[9px] text-gray-400">
                    Máx. 5 imagens
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []).slice(
                        0,
                        5
                      );

                      setNovasFotos(files);
                    }}
                  />
                </label>

                {novasFotos.length > 0 && (
                  <p className="text-[10px] text-gray-500 mt-2">
                    {novasFotos.length} imagem(ns) selecionada(s)
                  </p>
                )}
              </div>

              <div className="bg-[#DCE7FF] border border-[#BFDBFE] rounded-lg p-4 flex gap-3 items-center">
                <ShieldCheck size={18} className="text-[#2563EB] shrink-0" />

                <p className="text-[11px] text-[#0B1B4D] font-medium">
                  Boas fotos aumentam suas chances de receber mais solicitações!
                </p>
              </div>
            </div>

            <div className="px-7 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button
                type="button"
                onClick={() => {
                  setModalAdicionarAberto(false);
                  limparFormularioNovoServico();
                }}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={salvandoServico}
                className="px-5 py-2 bg-[#F97316] text-white rounded-lg text-xs font-bold hover:bg-[#EA580C] disabled:opacity-60"
              >
                {salvandoServico ? "Adicionando..." : "Adicionar serviço"}
              </button>
            </div>
          </form>
        </div>
      )}

      {solicitacaoParaRecusar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative flex flex-col gap-4">
            <button
              onClick={() => setSolicitacaoParaRecusar(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex gap-3 items-start">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <AlertTriangle size={24} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#0B1B4D]">
                  Recusar Solicitação?
                </h3>

                <p className="text-xs text-gray-400">
                  Você removerá o pedido de{" "}
                  <strong>{solicitacaoParaRecusar.nome_usuario}</strong>{" "}
                  permanentemente.
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setSolicitacaoParaRecusar(null)}
                className="px-4 py-2 border text-gray-600 font-bold text-xs rounded-xl cursor-pointer"
              >
                Voltar
              </button>

              <button
                onClick={confirmarRecusarSolicitacao}
                className="px-5 py-2 bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Sim, recusar
              </button>
            </div>
          </div>
        </div>
      )}

      {solicitacaoEmDetalhe && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setSolicitacaoEmDetalhe(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-lg font-bold text-[#0B1B4D]">
                Detalhes da solicitação #{solicitacaoEmDetalhe.id_solicitacao}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Solicitado por <strong>{solicitacaoEmDetalhe.nome_usuario || "Cliente"}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-[11px] font-bold text-gray-500">Status</p>
                <p className="text-sm text-gray-800 mt-1">{statusSolicitacaoLabel(solicitacaoEmDetalhe.status)}</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-[11px] font-bold text-gray-500">Data da solicitação</p>
                <p className="text-sm text-gray-800 mt-1">{formatarData(solicitacaoEmDetalhe.data_solicitacao, true)}</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-[11px] font-bold text-gray-500">Data de agendamento</p>
                <p className="text-sm text-gray-800 mt-1">{formatarData(solicitacaoEmDetalhe.data_agendamento, true)}</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-[11px] font-bold text-gray-500">Endereço</p>
                <p className="text-sm text-gray-800 mt-1">{solicitacaoEmDetalhe.endereco || "Não informado"}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
              <div>
                <p className="text-[11px] font-bold text-gray-500">Descrição do serviço</p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                  {solicitacaoEmDetalhe.descricao_servico || "Não informado"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-500">Complemento</p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                  {solicitacaoEmDetalhe.complemento || "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  setSolicitacaoParaRecusar(solicitacaoEmDetalhe);
                  setSolicitacaoEmDetalhe(null);
                }}
                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl cursor-pointer"
              >
                Recusar
              </button>

              <button
                onClick={async () => {
                  await aceitarSolicitacao(solicitacaoEmDetalhe);
                  setSolicitacaoEmDetalhe(null);
                }}
                className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Aceitar
              </button>
            </div>
          </div>
        </div>
      )}

      {servicoEmDetalhe && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setServicoEmDetalhe(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-lg font-bold text-[#0B1B4D]">
                Detalhes do serviço #{servicoEmDetalhe.id_servico}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {servicoEmDetalhe.titulo}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-[11px] font-bold text-gray-500">Status</p>
                <p className="text-sm text-gray-800 mt-1 capitalize">{servicoEmDetalhe.status_servico || "Não informado"}</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-[11px] font-bold text-gray-500">Categoria</p>
                <p className="text-sm text-gray-800 mt-1">
                  {servicoEmDetalhe.nome_categoria || buscarNomeCategoriaPorId(servicoEmDetalhe.id_categoria) || "Não informado"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-[11px] font-bold text-gray-500">Data de início</p>
                <p className="text-sm text-gray-800 mt-1">{formatarData(servicoEmDetalhe.data_inicio, true)}</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-[11px] font-bold text-gray-500">Data de fim</p>
                <p className="text-sm text-gray-800 mt-1">{formatarData(servicoEmDetalhe.data_fim, true)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
              <div>
                <p className="text-[11px] font-bold text-gray-500">Descrição</p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                  {servicoEmDetalhe.descricao || "Não informado"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-500">Tempo estimado</p>
                <p className="text-sm text-gray-700 mt-1">{servicoEmDetalhe.tempo_execucao || "Não informado"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-gray-500">Imagens do serviço</p>
              {obterImagensServico(servicoEmDetalhe).length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-5 text-xs text-gray-400 text-center">
                  Este serviço não possui imagens.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {obterImagensServico(servicoEmDetalhe).map((imagem, index) => (
                    <div key={`${imagem}-${index}`} className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[4/3]">
                      <img src={imagem} alt={`${servicoEmDetalhe.titulo} ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {servicoParaAvaliar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl relative flex flex-col overflow-hidden my-auto border border-gray-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">
                Avaliar cliente do serviço
              </h2>

              <button
                onClick={() => setServicoParaAvaliar(null)}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">
                  Como você avalia esse cliente?
                </label>

                <div className="flex items-center gap-3">
                  <RenderEstrelasClicaveis
                    valorAtual={notaGeral}
                    onChange={setNotaGeral}
                  />

                  <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-0.5 rounded-md">
                    {notaGeral === 5
                      ? "Excelente!"
                      : notaGeral === 4
                      ? "Muito bom"
                      : notaGeral === 3
                      ? "Regular"
                      : notaGeral === 2
                      ? "Ruim"
                      : "Péssimo"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-gray-500 text-xs">
                  Deixe seu comentário/opcional
                </span>

                <textarea
                  value={comentario}
                  onChange={(e) =>
                    setComentario(e.target.value.slice(0, 500))
                  }
                  placeholder="Conte um pouco sobre sua experiência com este cliente..."
                  className="w-full min-h-[100px] bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-amber-400 focus:bg-white transition resize-none"
                />

                <div className="text-right text-[10px] text-gray-400">
                  {comentario.length}/500
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700">
                  Avalie também os aspectos do serviço
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-gray-100 rounded-xl p-3 flex flex-col gap-1 bg-white shadow-sm">
                    <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-gray-400" />
                      Comunicação
                    </span>

                    <div className="flex items-center justify-between mt-1">
                      <RenderEstrelasClicaveis
                        valorAtual={notasCriterios.comunicacao}
                        onChange={(v) =>
                          setNotasCriterios((p) => ({
                            ...p,
                            comunicacao: v,
                          }))
                        }
                      />

                      <span className="text-[11px] font-bold text-gray-500">
                        {notasCriterios.comunicacao.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-3 flex flex-col gap-1 bg-white shadow-sm">
                    <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                      <Users size={13} className="text-gray-400" />
                      Respeito
                    </span>

                    <div className="flex items-center justify-between mt-1">
                      <RenderEstrelasClicaveis
                        valorAtual={notasCriterios.respeito}
                        onChange={(v) =>
                          setNotasCriterios((p) => ({
                            ...p,
                            respeito: v,
                          }))
                        }
                      />

                      <span className="text-[11px] font-bold text-gray-500">
                        {notasCriterios.respeito.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-3 flex flex-col gap-1 bg-white shadow-sm">
                    <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                      <Clock size={13} className="text-gray-400" />
                      Pontualidade
                    </span>

                    <div className="flex items-center justify-between mt-1">
                      <RenderEstrelasClicaveis
                        valorAtual={notasCriterios.pontualidade}
                        onChange={(v) =>
                          setNotasCriterios((p) => ({
                            ...p,
                            pontualidade: v,
                          }))
                        }
                      />

                      <span className="text-[11px] font-bold text-gray-500">
                        {notasCriterios.pontualidade.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-3 flex flex-col gap-1 bg-white shadow-sm">
                    <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                      <Check size={13} className="text-gray-400" />
                      Acordo
                    </span>

                    <div className="flex items-center justify-between mt-1">
                      <RenderEstrelasClicaveis
                        valorAtual={notasCriterios.acordo}
                        onChange={(v) =>
                          setNotasCriterios((p) => ({
                            ...p,
                            acordo: v,
                          }))
                        }
                      />

                      <span className="text-[11px] font-bold text-gray-500">
                        {notasCriterios.acordo.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#EFF6FF] rounded-xl p-3.5 flex gap-3 items-start border border-[#BFDBFE]">
                <CheckCircle size={18} className="text-blue-600 shrink-0" />

                <p className="text-[11px] text-slate-600 leading-normal font-medium">
                  Sua avaliação é privada e será usada para melhorar a
                  experiência na plataforma.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setServicoParaAvaliar(null)}
                className="px-5 py-2 border border-gray-300 bg-white text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={enviarAvaliacao}
                className="px-6 py-2 bg-[#F97316] text-white font-semibold text-xs rounded-xl hover:bg-[#EA580C] shadow-md transition cursor-pointer"
              >
                Enviar avaliação
              </button>
            </div>
          </div>
        </div>
      )}

      {alertConfig.visivel && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-white border rounded-2xl p-4 shadow-xl max-w-sm transition-all duration-300 select-none">
          {alertConfig.tipo === "success" ? (
            <div className="text-green-500 bg-green-50 p-2 rounded-xl">
              <CheckCircle size={20} />
            </div>
          ) : (
            <div className="text-red-500 bg-red-50 p-2 rounded-xl">
              <XCircle size={20} />
            </div>
          )}

          <div className="flex-1">
            <p className="text-xs font-bold text-gray-800 leading-snug">
              {alertConfig.mensagem}
            </p>
          </div>

          <button
            onClick={() =>
              setAlertConfig((prev) => ({
                ...prev,
                visivel: false,
              }))
            }
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
