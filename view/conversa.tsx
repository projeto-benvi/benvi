"use client";
import logo from "@/assets/benvi colorido 2.svg"
import { Search, Plus, Mic, ThumbsUp, SmilePlus, AlertTriangle, X, EllipsisVertical, Star, StepForward } from "lucide-react";
import SearchBar from "@/components/searchBar";
import { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";


export default function Conversa() {
  const { data: session } = useSession();

   const [fotos, setFotos] = useState<File[]>([]);
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataServico, setDataServico] = useState("");
  const [endereco, setEndereco] = useState("");
  const [modalSolicitacaoAberto, setModalSolicitacaoAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [buscaMensagens, setBuscaMensagens] = useState("");
  const [mostrarBuscaMensagens, setMostrarBuscaMensagens] = useState(false);
  const [mostrarMenuAcoes, setMostrarMenuAcoes] = useState(false);
  const [mostrarPainelEmoji, setMostrarPainelEmoji] = useState(false);
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [notificacao, setNotificacao] = useState<{
    titulo: string;
    mensagem: string;
    tipo: "sucesso" | "erro" | "info";
  } | null>(null);
  const [modalDenunciaAberto, setModalDenunciaAberto] = useState(false);
  const [denunciaEnviando, setDenunciaEnviando] = useState(false);
  const [denunciaMensagem, setDenunciaMensagem] = useState("");
  const [anexoEmDestaque, setAnexoEmDestaque] = useState<ConteudoAnexo | null>(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [complementoSolicitacao, setComplementoSolicitacao] = useState("");
  const [suporteAtivo, setSuporteAtivo] = useState(false);
  const [suporteTexto, setSuporteTexto] = useState("");
  const [suporteMensagens, setSuporteMensagens] = useState<MensagemSuporte[]>([]);
  const [carregandoSuporte, setCarregandoSuporte] = useState(false);
  const [enviandoSuporte, setEnviandoSuporte] = useState(false);
  const [erro, setErro] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const inputMensagemRef = useRef<HTMLInputElement>(null);
  const inputBuscaMensagemRef = useRef<HTMLInputElement>(null);
  const inputAnexoRef = useRef<HTMLInputElement>(null);
  const fimMensagensRef = useRef<HTMLDivElement>(null);
  const notificacaoTimerRef = useRef<number | null>(null);

  // ==========================
  // TYPES
  // ==========================

  type Mensagem = {
    idMensagem: number;
    idConversa: number;
    idRemetente: number;
    conteudo: string;
    criadoEm: string;
  };

  type ConteudoAnexo = {
    tipo: "imagem" | "video" | "pdf";
    nome: string;
    mimeType: string;
    url: string;
  };

  type Chat = {
  idConversa: number;
  idUsuario: number;
  idPrestador: number;

  nome?: string;
  fotoPerfil?: string;

  ultimaMensagemEm: string;

  mensagens?: Mensagem[];
};

  type MensagemSuporte = {
    id: string;
    lado: "usuario" | "admin";
    texto: string;
    data: string;
  };
  // ==========================
  // STATES
  // ==========================

  const [listaChats, setListaChats] = useState<Chat[]>([]);
  const [chatSelecionado, setChatSelecionado] = useState<Chat | null>(null);

  const idUsuarioLogado = Number((session?.user as any)?.id ?? 0);
  const isAdmin = (session?.user as any)?.isAdmin ?? false;
  const tipoParticipanteLogado: "usuario" | "prestador" | "admin" = isAdmin
    ? "admin"
    : (session?.user as any)?.isPrestador
    ? "prestador"
    : "usuario";

  const nomeChat = (chat: Chat) => chat.nome?.trim() || `Conversa ${chat.idConversa}`;

  const exibirNotificacao = (
    titulo: string,
    mensagem: string,
    tipo: "sucesso" | "erro" | "info" = "info"
  ) => {
    if (notificacaoTimerRef.current) {
      window.clearTimeout(notificacaoTimerRef.current);
    }

    setNotificacao({ titulo, mensagem, tipo });

    notificacaoTimerRef.current = window.setTimeout(() => {
      setNotificacao(null);
      notificacaoTimerRef.current = null;
    }, 3200);
  };

  const limparNotificacao = () => {
    if (notificacaoTimerRef.current) {
      window.clearTimeout(notificacaoTimerRef.current);
      notificacaoTimerRef.current = null;
    }

    setNotificacao(null);
  };

  const obterLabelAnexo = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "Imagem";
    if (mimeType.startsWith("video/")) return "Vídeo";
    if (mimeType === "application/pdf") return "PDF";
    return "Arquivo";
  };

  const ehConteudoAnexo = (conteudo: string): conteudo is string => {
    try {
      const parsed = JSON.parse(conteudo) as ConteudoAnexo;
      return Boolean(parsed && parsed.url && parsed.nome && parsed.mimeType && parsed.tipo);
    } catch {
      return false;
    }
  };

  const interpretarConteudo = (conteudo: string): ConteudoAnexo | null => {
    try {
      const parsed = JSON.parse(conteudo) as ConteudoAnexo;
      if (!parsed || !parsed.url || !parsed.nome || !parsed.mimeType || !parsed.tipo) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  };

  const abrirAnexoEmDestaque = (anexo: ConteudoAnexo) => {
    setAnexoEmDestaque(anexo);
  };

  const fecharAnexoEmDestaque = () => {
    setAnexoEmDestaque(null);
  };

  // ==========================
  // FILTRO
  // ==========================

  const chatsFiltrados = listaChats.filter((chat) =>
    nomeChat(chat).toLowerCase().includes(busca.toLowerCase())
  );

  const mensagensFiltradas = chatSelecionado?.mensagens?.filter((msg) =>
    msg.conteudo.toLowerCase().includes(buscaMensagens.toLowerCase())
  ) ?? [];

  // ==========================
  // SCROLL
  // ==========================

  useEffect(() => {
    fimMensagensRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chatSelecionado?.mensagens]);

  useEffect(() => {
    return () => {
      if (notificacaoTimerRef.current) {
        window.clearTimeout(notificacaoTimerRef.current);
      }
    };
  }, []);

  // ==========================
  // CONVERSAS
  // ==========================

  const carregarConversas = async () => {
    if (!idUsuarioLogado) return;

    try {
      const response = await fetch(
        `/api/conversas?idParticipante=${idUsuarioLogado}&tipoParticipante=${tipoParticipanteLogado}`
      );

      const dados = await response.json();

      setListaChats(Array.isArray(dados) ? dados : []);

      if (Array.isArray(dados) && dados.length > 0 && !chatSelecionado) {
        setChatSelecionado(dados[0]);
        carregarMensagens(dados[0].idConversa);
      }

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    carregarConversas();
  }, [idUsuarioLogado, tipoParticipanteLogado]);

  const carregarSuporte = async () => {
    if (!idUsuarioLogado) return;

    setCarregandoSuporte(true);

    try {
      const response = await fetch(`/api/ticketSuporte?id_usuario=${idUsuarioLogado}`);
      const tickets = await response.json();

      if (!response.ok || !Array.isArray(tickets)) {
        throw new Error("Não foi possível carregar os tickets de suporte.");
      }

      const itens: MensagemSuporte[] = [];

      tickets.forEach((ticket: any) => {
        itens.push({
          id: `usuario-${ticket.id_ticket}`,
          lado: "usuario",
          texto: String(ticket.descricao ?? ""),
          data: ticket.data_abertura ?? new Date().toISOString(),
        });

        if (ticket.resposta_admin) {
          itens.push({
            id: `admin-${ticket.id_ticket}`,
            lado: "admin",
            texto: ticket.resposta_admin,
            data: ticket.data_encerramento ?? ticket.data_abertura ?? new Date().toISOString(),
          });
        }
      });

      itens.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      setSuporteMensagens(itens);
    } catch (error) {
      console.error(error);
      exibirNotificacao("Suporte indisponível", "Não foi possível carregar o histórico com o administrador.", "erro");
    } finally {
      setCarregandoSuporte(false);
    }
  };

  const abrirSuporte = async () => {
    setSuporteAtivo(true);
    setChatSelecionado(null);
    setMostrarMenuAcoes(false);
    setMostrarPainelEmoji(false);
    await carregarSuporte();
  };

  const enviarMensagemSuporte = async () => {
    if (!suporteTexto.trim() || enviandoSuporte) return;

    if (!idUsuarioLogado) {
      exibirNotificacao("Login necessário", "Entre na conta para conversar com o administrador.", "erro");
      return;
    }

    setEnviandoSuporte(true);

    try {
      const response = await fetch("/api/ticketSuporte", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: idUsuarioLogado,
          titulo: "Suporte",
          descricao: suporteTexto.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível enviar a mensagem ao suporte.");
      }

      setSuporteTexto("");
      await carregarSuporte();
      exibirNotificacao("Mensagem enviada", "Sua mensagem foi enviada para o administrador.", "sucesso");
    } catch (error) {
      console.error(error);
      exibirNotificacao("Falha no suporte", "Não foi possível enviar a mensagem agora.", "erro");
    } finally {
      setEnviandoSuporte(false);
    }
  };

  // ==========================
  // MENSAGENS
  // ==========================

  const carregarMensagens = async (idConversa: number) => {
    try {
      const response = await fetch(
        `/api/mensagens?idConversa=${idConversa}`
      );

      const mensagens: Mensagem[] = await response.json();

      setListaChats((anterior) =>
        anterior.map((chat) =>
          chat.idConversa === idConversa
            ? { ...chat, mensagens }
            : chat
        )
      );

      setChatSelecionado((anterior) =>
        anterior && anterior.idConversa === idConversa
          ? { ...anterior, mensagens }
          : anterior
      );

    } catch (error) {
      console.error(error);
    }
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim()) return;

    if (!chatSelecionado) return;

    try {
      await fetch("/api/mensagens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idConversa: chatSelecionado.idConversa,
          idRemetente: idUsuarioLogado,
          conteudo: novaMensagem,
        }),
      });

      await carregarMensagens(chatSelecionado.idConversa);

      setNovaMensagem("");
      exibirNotificacao("Mensagem enviada", "Sua mensagem foi publicada na conversa.", "sucesso");

    } catch (error) {
      console.error(error);
      exibirNotificacao("Falha ao enviar", "Não foi possível enviar a mensagem agora.", "erro");
    }
  };

  // ==========================
  // FOTOS
  // ==========================

  const handleFotos = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const arquivos = Array.from(e.target.files || []);

    const novasFotos = [...fotos, ...arquivos].slice(0, 5);

    setFotos(novasFotos);
  };

  const lerArquivoComoDataURL = (arquivo: File) =>
    new Promise<string>((resolve, reject) => {
      const leitor = new FileReader();

      leitor.onload = () => resolve(String(leitor.result ?? ""));
      leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
      leitor.readAsDataURL(arquivo);
    });

  const identificarTipoArquivo = (mimeType: string): ConteudoAnexo["tipo"] | null => {
    if (mimeType.startsWith("image/")) return "imagem";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType === "application/pdf") return "pdf";
    return null;
  };

  // ==========================
  // SOLICITAÇÃO
  // ==========================

  const enviarSolicitacao = async () => {

    if (!chatSelecionado) {
      setErro("Selecione uma conversa para solicitar o serviço.");
      return;
    }

    if (!idUsuarioLogado) {
      setErro("Faça login para solicitar um serviço.");
      return;
    }

    if (tipoParticipanteLogado !== "usuario") {
      setErro("A solicitação deve ser feita por um usuário comum.");
      return;
    }

    if (!categoria) {
      setErro("Selecione uma Categoria.");
      return;
    }

    if (!descricao) {
      setErro("Informe a Descrição do Serviço.");
      return;
    }

    if (!dataServico) {
      setErro("Selecione uma Data.");
      return;
    }

    if (!endereco) {
      setErro("Informe o Endereço.");
      return;
    }

    setErro("");

    const solicitacao = {
      categoria,
      descricao,
      dataServico,
      endereco,
      fotos,
    };

    console.log(solicitacao);

    setCategoria("");
    setDescricao("");
    setDataServico("");
    setEndereco("");
    setFotos([]);

    setModalSolicitacaoAberto(false);

    try {
      const response = await fetch("/api/solicitacaoservico", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: idUsuarioLogado,
          id_prestador: chatSelecionado.idPrestador,
          endereco,
          data_agendamento: dataServico,
          descricao_servico: descricao,
          complemento: complementoSolicitacao || categoria,
        }),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado?.error || "Não foi possível enviar a solicitação.");
      }

      exibirNotificacao("Solicitação enviada", "O pedido foi registrado com sucesso.", "sucesso");
      setCategoria("");
      setDescricao("");
      setDataServico("");
      setEndereco("");
      setComplementoSolicitacao("");
      setFotos([]);
      setModalSolicitacaoAberto(false);
    } catch (error) {
      console.error(error);
      exibirNotificacao(
        "Falha ao solicitar",
        error instanceof Error ? error.message : "Não foi possível enviar a solicitação agora.",
        "erro"
      );
    }
  };

  const alternarFavorito = () => {
    if (!chatSelecionado) return;

    setFavoritos((anterior) => {
      const jaFavorito = anterior.includes(chatSelecionado.idConversa);

      if (jaFavorito) {
        exibirNotificacao("Favorito removido", "A conversa saiu da sua lista de favoritos.", "info");
        return anterior.filter((id) => id !== chatSelecionado.idConversa);
      }

      exibirNotificacao("Favorito salvo", "A conversa foi adicionada aos seus favoritos.", "sucesso");
      return [...anterior, chatSelecionado.idConversa];
    });
  };

  const enviarLike = async () => {
    if (!chatSelecionado) return;

    await fetch("/api/mensagens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idConversa: chatSelecionado.idConversa,
        idRemetente: idUsuarioLogado,
        conteudo: "👍",
      }),
    });

    carregarMensagens(chatSelecionado.idConversa);
  };

  const alternarBuscaMensagens = () => {
    const vaiMostrarBusca = !mostrarBuscaMensagens;

    setMostrarBuscaMensagens(vaiMostrarBusca);
    setMostrarMenuAcoes(false);
    setMostrarPainelEmoji(false);

    if (vaiMostrarBusca) {
      setTimeout(() => inputBuscaMensagemRef.current?.focus(), 0);
    }
  };

  const anexarArquivosNaConversa = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!chatSelecionado) return;

    const arquivos = Array.from(e.target.files || []);

    if (arquivos.length === 0) return;

    try {
      await Promise.all(
        arquivos.map(async (arquivo) => {
          const tipo = identificarTipoArquivo(arquivo.type);

          if (!tipo) {
            throw new Error(`O arquivo ${arquivo.name} não é imagem, vídeo ou PDF.`);
          }

          const url = await lerArquivoComoDataURL(arquivo);

          return fetch("/api/mensagens", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              idConversa: chatSelecionado.idConversa,
              idRemetente: idUsuarioLogado,
              conteudo: JSON.stringify({
                tipo,
                nome: arquivo.name,
                mimeType: arquivo.type,
                url,
              } satisfies ConteudoAnexo),
            }),
          });
        })
      );

      await carregarMensagens(chatSelecionado.idConversa);
      exibirNotificacao("Arquivo enviado", "O anexo foi publicado na conversa.", "sucesso");
    } catch (error) {
      console.error(error);
      exibirNotificacao("Falha no envio", error instanceof Error ? error.message : "Não foi possível enviar o anexo.", "erro");
    } finally {
      e.target.value = "";
    }
  };

  const denunciarConversa = async () => {
    if (!chatSelecionado) return;

    setModalDenunciaAberto(true);
  };

  const enviarDenuncia = async () => {
    if (!chatSelecionado || denunciaEnviando) return;

    const idUsuarioReportado =
      tipoParticipanteLogado === "prestador"
        ? chatSelecionado.idUsuario
        : chatSelecionado.idPrestador;

    setDenunciaEnviando(true);

    try {
      const response = await fetch("/api/ticketSuporte", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: idUsuarioLogado,
          titulo: `Denúncia da conversa #${chatSelecionado.idConversa}`,
          descricao: denunciaMensagem.trim()
            ? `${denunciaMensagem.trim()}\n\nUsuário reportado: ${idUsuarioReportado}\nConversa: ${chatSelecionado.idConversa}`
            : `Denúncia enviada na conversa ${chatSelecionado.idConversa}. Usuário reportado: ${idUsuarioReportado}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao reportar conversa");
      }

      setModalDenunciaAberto(false);
      setDenunciaMensagem("");
      exibirNotificacao("Denúncia enviada", "Recebemos sua solicitação e ela será analisada.", "sucesso");
    } catch (error) {
      console.error(error);
      exibirNotificacao("Falha na denúncia", "Não foi possível enviar a denúncia agora.", "erro");
    } finally {
      setDenunciaEnviando(false);
    }
  };

  const inserirEmoji = (emoji: string) => {
    setNovaMensagem((anterior) => `${anterior}${emoji}`);
    setMostrarPainelEmoji(false);
    inputMensagemRef.current?.focus();
  };

  const executarAcaoMenu = async (acao: "recarregar" | "limpar" | "fechar") => {
    if (acao === "recarregar" && chatSelecionado) {
      await carregarMensagens(chatSelecionado.idConversa);
      exibirNotificacao("Mensagens atualizadas", "O histórico da conversa foi recarregado.", "info");
    }

    if (acao === "limpar") {
      setNovaMensagem("");
      exibirNotificacao("Campo limpo", "A mensagem atual foi removida do campo de texto.", "info");
    }

    if (acao === "fechar") {
      setChatSelecionado(null);
      setBuscaMensagens("");
      exibirNotificacao("Conversa fechada", "A conversa saiu da área principal.", "info");
    }

    setMostrarMenuAcoes(false);
  };















  return (
    <div className="h-screen flex flex-col bg-white">

      {anexoEmDestaque && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
          onClick={fecharAnexoEmDestaque}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {obterLabelAnexo(anexoEmDestaque.mimeType)}
                </p>
                <h3 className="mt-1 truncate text-lg font-semibold text-slate-900">
                  {anexoEmDestaque.nome}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={anexoEmDestaque.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Abrir em nova aba
                </a>

                <button
                  onClick={fecharAnexoEmDestaque}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4">
              {anexoEmDestaque.tipo === "imagem" && (
                <img
                  src={anexoEmDestaque.url}
                  alt={anexoEmDestaque.nome}
                  className="max-h-[80vh] w-full rounded-2xl object-contain bg-white"
                />
              )}

              {anexoEmDestaque.tipo === "video" && (
                <video
                  controls
                  autoPlay={false}
                  className="max-h-[80vh] w-full rounded-2xl bg-black"
                  src={anexoEmDestaque.url}
                />
              )}

              {anexoEmDestaque.tipo === "pdf" && (
                <iframe
                  title={anexoEmDestaque.nome}
                  src={anexoEmDestaque.url}
                  className="h-[80vh] w-full rounded-2xl border-0 bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {notificacao && (
        <div className="fixed right-5 top-5 z-[80] w-[320px] rounded-2xl border border-white/20 bg-slate-950/95 text-white shadow-2xl shadow-slate-950/20 backdrop-blur-xl overflow-hidden">
          <div className={`h-1 w-full ${notificacao.tipo === "sucesso" ? "bg-emerald-400" : notificacao.tipo === "erro" ? "bg-rose-400" : "bg-sky-400"}`} />
          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{notificacao.titulo}</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">{notificacao.mensagem}</p>
              </div>
              <button onClick={limparNotificacao} className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SearchBar */}
      <div className="border-b border-[#CDCDCD] shrink-0">
        <SearchBar />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 overflow-hidden">

        {/* Lista de Conversas */}
        <aside className="w-[25%] min-w-[260px] max-w-[340px] border-r border-[#CDCDCD] bg-white flex flex-col">
          <div className="h-20 px-4 border-b border-[#CDCDCD] flex items-center">
            <div className="flex items-center gap-4 rounded-full border-hidden bg-cyan-50 border-[#CDCDCD] px-7 h-12 w-full">
              <button onClick={() => inputRef.current?.focus()}
              className="cursor-pointer">
                <Search size={18} color="blue" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar conversa..."
                className="flex-1 h-full bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chatsFiltrados.map((chat) => (
              <div
              key={chat.idConversa}
              onClick={() => {
                setSuporteAtivo(false);
                setChatSelecionado(chat);
                carregarMensagens(chat.idConversa);
              }}
              className={`
                flex gap-3 px-4 py-4 border-b border-[#CDCDCD]
                cursor-pointer
                hover:bg-[#F7F7F7]
                ${chatSelecionado?.idConversa === chat.idConversa ? "bg-blue-50" : ""}
              `}>
                <div className="h-12 w-12 rounded-full bg-gray-300 shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-sm">
                      {nomeChat(chat)}
                    </h3>

                    <span className="text-xs text-gray-400">
                      {new Date(chat.ultimaMensagemEm).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 truncate">
                    {chat.mensagens?.[chat.mensagens.length - 1]?.conteudo}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Contato fixo */}
          <div className="border-t border-[#CDCDCD] bg-white shrink-0">
            <div
              onClick={abrirSuporte}
              className={`flex gap-3 px-4 py-4 cursor-pointer hover:bg-[#F7F7F7] ${suporteAtivo ? "bg-blue-50" : ""}`}
            >
              <div className="h-12 w-12 rounded-full shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={logo.src}
                  alt="Suporte"
                  className="w-8 h-8 object-contain"
                />
              </div>  
                
              <div>
                <h3 className="font-medium text-sm">
                  Suporte
                </h3>

                <p className="text-sm text-gray-500">
                  Conversar com administrador
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Área do Chat */}
        <section className="flex-1 min-w-0 flex flex-col bg-white">

          {/* Header da conversa */}
          <div className="h-20 border-b border-[#CDCDCD] px-6 flex items-center justify-between">

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-300" />

              <div>
                <h2 className="font-semibold text-[15px]">
                  {suporteAtivo ? "Suporte Benvi" : (chatSelecionado?.nome ?? "Selecione uma conversa")}
                </h2>

                <p className="text-sm text-gray-500">
                  {suporteAtivo ? "Administrador" : "Prestador"}
                </p>
              </div>

              {!suporteAtivo && (
              <button  onClick={() => setModalSolicitacaoAberto(true)}
              className="ml-4 bg-[#2F80ED] text-white px-5 py-2 rounded-full text-sm hover:bg-blue-600 cursor-pointer">
                Solicitar serviço
              </button>
              )}

            </div>
            
            {/* Lado direito */}
            {!suporteAtivo && (
            <div className="flex items-center gap-4">
              
              <button
                onClick={alternarFavorito}
                className="p-2 rounded-full hover:bg-blue-200 cursor-pointer"
              >
                  <Star
                    size={20}
                    color="blue"
                    fill={
                      chatSelecionado && favoritos.includes(chatSelecionado.idConversa)
                        ? "blue"
                        : "none"
                    }
                  />
              </button>
              <button
                onClick={alternarBuscaMensagens}
                className="p-2 rounded-full hover:bg-gray-200 cursor-pointer"
              >
                  <Search  size={20} />
              </button>

              <div className="relative">
                <button
                  onClick={() => {
                    setMostrarMenuAcoes((anterior) => !anterior);
                    setMostrarPainelEmoji(false);
                  }}
                  className="p-2 rounded-full hover:bg-gray-200 cursor-pointer"
                >
                  <EllipsisVertical size={20} />
                </button>

                {mostrarMenuAcoes && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-[#CDCDCD] rounded-lg shadow-md z-20">
                    <button
                      onClick={() => executarAcaoMenu("recarregar")}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      Recarregar mensagens
                    </button>
                    <button
                      onClick={() => executarAcaoMenu("limpar")}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      Limpar campo
                    </button>
                    <button
                      onClick={() => executarAcaoMenu("fechar")}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Fechar conversa
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={denunciarConversa}
                className="p-2 rounded-full hover:bg-red-200 cursor-pointer"
              >
                  <AlertTriangle color="red" size={20} />
              </button>

            </div>
            )}
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto bg-[#FAFAFA] px-8 py-6">

            {!suporteAtivo && mostrarBuscaMensagens && (
              <div className="mb-4">
                <input
                  ref={inputBuscaMensagemRef}
                  value={buscaMensagens}
                  onChange={(e) => setBuscaMensagens(e.target.value)}
                  placeholder="Buscar nesta conversa..."
                  className="w-full border border-[#CDCDCD] rounded-full px-4 py-2 outline-none bg-white"
                />
              </div>
            )}

            {suporteAtivo && (
              <div className="space-y-4">
                {carregandoSuporte && (
                  <p className="text-sm text-slate-500">Carregando histórico de suporte...</p>
                )}

                {!carregandoSuporte && suporteMensagens.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
                    Nenhuma conversa com o administrador ainda. Envie uma mensagem para abrir atendimento.
                  </div>
                )}

                {suporteMensagens.map((mensagem) => (
                  <div key={mensagem.id} className={`mb-5 flex ${mensagem.lado === "usuario" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] whitespace-pre-line rounded-2xl px-5 py-3 ${mensagem.lado === "usuario" ? "bg-[#2F80ED] text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-700 rounded-bl-none"}`}>
                      <p>{mensagem.texto}</p>
                      <p className={`mt-1 text-[11px] ${mensagem.lado === "usuario" ? "text-blue-100" : "text-slate-400"}`}>
                        {new Date(mensagem.data).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!suporteAtivo && mensagensFiltradas.map((msg) => {

              const enviadaPorMim = msg.idRemetente === idUsuarioLogado;
              const anexo = ehConteudoAnexo(msg.conteudo) ? interpretarConteudo(msg.conteudo) : null;
              const textoMensagem = anexo ? null : msg.conteudo;

              return (
                <div
                  key={msg.idMensagem}
                  className={`mb-5 flex ${
                    enviadaPorMim
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[60%] px-5 py-3 rounded-2xl ${
                      enviadaPorMim
                        ? "bg-[#2F80ED] text-white rounded-br-none"
                        : "bg-[#DCE6FF] text-[#333] rounded-bl-none"
                    }`}
                  >
                    {anexo ? (
                      <button
                        type="button"
                        onClick={() => abrirAnexoEmDestaque(anexo)}
                        className="w-full space-y-3 rounded-2xl text-left transition hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-80">
                          <span className="rounded-full bg-white/15 px-2 py-1">
                            {obterLabelAnexo(anexo.mimeType)}
                          </span>
                          <span className="truncate">{anexo.nome}</span>
                        </div>

                        {anexo.tipo === "imagem" && (
                          <img src={anexo.url} alt={anexo.nome} className="max-h-80 w-full rounded-xl object-cover ring-1 ring-white/10" />
                        )}

                        {anexo.tipo === "video" && (
                          <div className="relative overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
                            <video className="max-h-80 w-full" src={anexo.url} />
                            <div className="absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/45 to-transparent p-4">
                              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                                Toque para abrir o vídeo
                              </span>
                            </div>
                          </div>
                        )}

                        {anexo.tipo === "pdf" && (
                          <div className="flex min-h-40 flex-col justify-between rounded-xl border border-white/15 bg-white/95 p-4 text-slate-900 ring-1 ring-white/10">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Prévia do PDF</p>
                              <p className="truncate text-sm font-medium text-slate-800">{anexo.nome}</p>
                              <p className="text-sm text-slate-500">Clique para visualizar o documento em tamanho grande.</p>
                            </div>

                            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                              Abrir PDF
                            </div>
                          </div>
                        )}
                      </button>
                    ) : (
                      <p>{textoMensagem}</p>
                    )}

                    <p
                      className={`text-[11px] mt-1 ${
                        enviadaPorMim
                          ? "text-blue-100"
                          : "text-gray-400"
                      }`}
                    >
                      {new Date(msg.criadoEm).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
          })}
            <div ref={fimMensagensRef}/>
          </div>
            
          {/* Input */}
          <div className="border-t border-[#CDCDCD] bg-white px-6 py-4">

            {suporteAtivo ? (
              <p className="mb-2 text-xs text-slate-500">Sua mensagem será enviada como ticket para o administrador.</p>
            ) : (
              <p className="text-xs text-slate-500 mb-2">
                Fotos, vídeos e PDFs são enviados como pré-visualização dentro da conversa.
              </p>
            )}

            {suporteAtivo ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center bg-cyan-50 rounded-full">
                  <input
                    value={suporteTexto}
                    onChange={(e) => setSuporteTexto(e.target.value)}
                    placeholder="Digite sua mensagem para o administrador..."
                    className="w-full flex-1 rounded-full bg-transparent px-5 py-3 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        enviarMensagemSuporte();
                      }
                    }}
                  />

                  <button
                    onClick={enviarMensagemSuporte}
                    disabled={enviandoSuporte}
                    className="rounded-full bg-cyan-100 p-3 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <StepForward size={20} fill="#3D64FD" color="#3D64FD" />
                  </button>
                </div>
              </div>
            ) : (

            <div className="flex items-center gap-3">

              <div className="relative">
                <button
                  onClick={() => {
                    setMostrarPainelEmoji((anterior) => !anterior);
                    setMostrarMenuAcoes(false);
                  }}
                  className="p-2 hover:bg-cyan-200 cursor-pointer rounded-full"
                >
                <SmilePlus size={20} color="#3D64FD" />
                </button>

                {mostrarPainelEmoji && (
                  <div className="absolute bottom-12 left-0 bg-white border border-[#CDCDCD] rounded-xl p-2 shadow-md flex gap-1 z-20">
                    {["😀", "😂", "😍", "🙏", "🔥", "✅"].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => inserirEmoji(emoji)}
                        className="text-lg p-1 hover:bg-gray-100 rounded"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>


              <div className="flex-1 flex items-center bg-cyan-50 rounded-full">
                <input
                ref={inputMensagemRef}
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                placeholder="Digite uma mensagem..."
                className="w-full flex-1 border-hidden border-[#CDCDCD] rounded-full px-5 py-3 outline-none"
                onKeyDown={(e) => {
                if (e.key === "Enter") {
                  enviarMensagem();
                }
                }}
                />

                <button onClick={enviarMensagem}
                className="p-3 hover:bg-cyan-300 bg-cyan-100 cursor-pointer rounded-full"
                >
                  <StepForward size={20} fill="#3D64FD" color="#3D64FD"/>
                </button>

              </div>
              
              <button
                onClick={() => inputAnexoRef.current?.click()}
                className="p-2 hover:bg-cyan-200 cursor-pointer rounded-full"
              >
                <Plus size={20} color="#3D64FD"/>
              </button>

              <input
                ref={inputAnexoRef}
                type="file"
                multiple
                accept="image/*,video/*,application/pdf"
                onChange={anexarArquivosNaConversa}
                className="hidden"
              />

              <button onClick={() => exibirNotificacao("Áudio em desenvolvimento", "O envio de áudio ainda não foi ativado.", "info")}
              className="p-2 hover:bg-cyan-200 cursor-pointer rounded-full">
                <Mic size={20} color="#3D64FD"/>
              </button>

              <button
                onClick={enviarLike}
                className="p-2 hover:bg-cyan-200 cursor-pointer rounded-full"
              >
                <ThumbsUp size={20} color="#3D64FD"/>
              </button>

            </div>
            )}
          </div>

        </section>
      </div>
      {modalSolicitacaoAberto && (
      <div
      className="fixed inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-50 inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={() => setModalSolicitacaoAberto(false)}
      >
        <div
        className="bg-white rounded-xl w-full max-w-[700px] max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
        >
          {/* Conteúdo do modal */}
          {/* Cabeçalho */}
          <div className="flex justify-between items-start p-6 border-b border-[#CDCDCD]">
            <div>
              <h2 className="text-2xl font-semibold">
                Nova solicitação de serviço
              </h2>
              {erro && (
                <div className="bg-red-50 border border-red-300 text-red-600 p-3 rounded-lg">
                  {erro}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Preencha os dados abaixo para enviar sua solicitação.
              </p>
            </div>

            <button
              onClick={() => setModalSolicitacaoAberto(false)}
              className="text-xl font-bold cursor-pointer"
            >
              ×
            </button>
          </div>


          {/* Corpo */}
          <div className="p-6 space-y-6">

            <div>
              <h3 className="font-semibold text-lg mb-4">
                1. Tipo de serviço
              </h3>

              <p className="mb-1 text-sm">
                Categoria do serviço <span className="text-red-500">*</span>
              </p>
              <select required 
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border border-[#CDCDCD] rounded-lg p-3"
              >
                <option value="">Selecione a categoria</option>
                <option value="Eletricista">
                  Eletricista
                </option>
              </select>

              <p className="mb-1 text-sm">
                Descrição do serviço <span className="text-red-500">*</span>
              </p>
              <textarea
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição do serviço"
                maxLength={500}
                className="w-full border border-[#CDCDCD] rounded-lg p-3 h-32 resize-none"
              />
              <div className="flex justify-end">
                <span className="text-right text-xs text-gray-400">
                  {descricao.length}/500
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">
                2. Detalhes
              </h3>
              <p className="mb-1 text-sm">
                Data desejada <span className="text-red-500">*</span>
              </p>
              <input
                type="date"
                value={dataServico}
                onChange={(e) => setDataServico(e.target.value)}
                required
                className="w-full border border-[#CDCDCD] rounded-lg p-3 mb-3"
              />
              <p className="mb-1 text-sm">
                Endereço <span className="text-red-500">*</span>
              </p>  
              <input
                required
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Digite seu endereço completo"
                className="w-full border border-[#CDCDCD] rounded-lg p-3 mb-3"
              />
              <p>Complemento (opcional)</p>  
              <input
                value={complementoSolicitacao}
                onChange={(e) => setComplementoSolicitacao(e.target.value)}
                placeholder="Apartamento, bloco, referência..."
                className="w-full border border-[#CDCDCD] rounded-lg p-3"
              />
            </div>

            <div>
              <p className="mb-2 text-sm">
                Enviar fotos (opcional)
              </p>

              <label
                htmlFor="upload-fotos"
                className="
                  border-2 border-dashed border-[#CDCDCD]
                  rounded-lg
                  p-8
                  flex flex-col items-center justify-center
                  cursor-pointer
                  hover:bg-gray-50
                "
              >
                <p className="text-sm font-medium">
                  Clique para adicionar fotos
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Máx. 5 imagens (10MB cada)
                </p>
              </label>

              <input
                id="upload-fotos"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFotos}
                className="hidden"
              />

              <p className="mt-2 text-xs text-slate-500">
                As fotos serão anexadas na solicitação para ajudar o prestador a entender melhor o serviço.
              </p>

              {fotos.length > 0 && (
                <div className="mt-4 max-h-52 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {fotos.map((foto, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2"
                    >
                      <img
                        src={URL.createObjectURL(foto)}
                        alt={`Foto ${index + 1}`}
                        className="h-14 w-14 shrink-0 rounded-md object-cover border"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-700">{foto.name}</p>
                        <p className="text-xs text-slate-400">{(foto.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setFotos(fotos.filter((_, i) => i !== index))
                        }
                        className="rounded-full bg-slate-100 p-1 shadow cursor-pointer hover:bg-red-100"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>


          {/* Rodapé */}
          <div className="flex justify-end gap-3 p-6 border-t border-[#CDCDCD]">

            <button
              onClick={() => setModalSolicitacaoAberto(false)}
              className="px-5 py-2 border border-[#CDCDCD] rounded-lg cursor-pointer"
            >
              Cancelar
            </button>

            <button
            onClick={enviarSolicitacao}
            className="px-5 py-2 bg-[#F97316] text-white rounded-lg cursor-pointer"
            >
              
              Enviar solicitação
            </button>
              
          </div>
              
        </div>
      </div>
      )}

      {modalDenunciaAberto && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm" onClick={() => !denunciaEnviando && setModalDenunciaAberto(false)}>
          <div className="w-full max-w-[540px] rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Denunciar conversa</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">Ajude a manter o ambiente seguro</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Descreva rapidamente o motivo da denúncia. Isso nos ajuda a analisar o caso com mais contexto.</p>
                </div>
                <button
                  onClick={() => !denunciaEnviando && setModalDenunciaAberto(false)}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
                A denúncia será enviada para análise. Você pode incluir detalhes opcionais abaixo.
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Detalhes opcionais</span>
                <textarea
                  value={denunciaMensagem}
                  onChange={(event) => setDenunciaMensagem(event.target.value)}
                  placeholder="Conte o que aconteceu, se quiser adicionar mais contexto..."
                  className="min-h-[130px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-6">
              <button
                onClick={() => setModalDenunciaAberto(false)}
                disabled={denunciaEnviando}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={enviarDenuncia}
                disabled={denunciaEnviando}
                className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {denunciaEnviando ? "Enviando..." : "Enviar denúncia"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}