"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

import logo from "@/assets/benvi colorido 2.svg";
import SearchBar from "@/components/searchBar";

import {
  AlertTriangle,
  ArrowLeft,
  EllipsisVertical,
  Eraser,
  Mic,
  Plus,
  RotateCw,
  Search,
  SmilePlus,
  Square,
  Star,
  StepForward,
  ThumbsUp,
  Trash2,
  X,
  XCircle,
} from "lucide-react";



export default function Conversa() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // ==========================================================
  // TYPES
  // ==========================================================

  type Mensagem = {
    idMensagem: number;
    idConversa: number;
    idRemetente: number;
    conteudo: string;
    criadoEm: string;
    lida: boolean;

    enviando?: boolean;
    erro?: boolean;
    tempId?: string;
    clientTempId?: string;
    tipo_mensagem?: "texto" | "audio" | "imagem" | "video" | "documento";
    arquivo_url?: string;
    arquivo_mime?: string;
    arquivo_tamanho?: number;
    audio_duracao?: number;
    audioLocalUrl?: string;
    audioBlob?: Blob;
    anexoArquivo?: File;
    anexoLocalUrl?: string;
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

  type CategoriaVinculada = {
    id_categoria?: number;
    nome_categoria?: string;
  };

  type MensagemSuporte = {
    id: string;
    lado: "usuario" | "admin";
    texto: string;
    data: string;
  };

  const mesclarMensagens = (atuais: Mensagem[], recebidas: Mensagem[]) => {
    const porId = new Map<number, Mensagem>();
    const temporarias = new Map<string | number, Mensagem>();

    for (const mensagem of [...atuais, ...recebidas]) {
      if (mensagem.idMensagem > 0) {
        porId.set(mensagem.idMensagem, mensagem);
      } else {
        temporarias.set(mensagem.tempId ?? mensagem.idMensagem, mensagem);
      }
    }

    const tempIdsConfirmados = new Set(
      recebidas.map((mensagem) => mensagem.clientTempId).filter(Boolean)
    );

    return [
      ...Array.from(temporarias.values()).filter(
        (mensagem) => !tempIdsConfirmados.has(mensagem.tempId)
      ),
      ...Array.from(porId.values()),
    ].sort((a, b) => {
      const data = new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime();
      return data || a.idMensagem - b.idMensagem;
    });
  };



  // ==========================================================
  // STATES - CONVERSAS
  // ==========================================================

  const [listaChats, setListaChats] = useState<Chat[]>([]);
  const [chatSelecionado, setChatSelecionado] =
    useState<Chat | null>(null);

  const [contadorNovasMensagens, setContadorNovasMensagens] =
    useState<Record<number, number>>({});

  const [mostrarListaMobile, setMostrarListaMobile] =
    useState(true);

  const [chatDiretoProcessado, setChatDiretoProcessado] =
    useState(false);



  // ==========================================================
  // STATES - MENSAGENS
  // ==========================================================

  const [novaMensagem, setNovaMensagem] = useState("");

  const [ultimoIdRecebido, setUltimoIdRecebido] =
    useState(0);

  const [novasMensagensPendentes, setNovasMensagensPendentes] =
    useState(0);

  const [abaVisivel, setAbaVisivel] =
    useState(true);

  const [estadoAudio, setEstadoAudio] =
    useState<"idle" | "requesting" | "recording" | "preview" | "sending" | "error">("idle");

  const [audioBlob, setAudioBlob] =
    useState<Blob | null>(null);

  const [audioPreviewUrl, setAudioPreviewUrl] =
    useState("");

  const [audioSegundos, setAudioSegundos] =
    useState(0);



  // ==========================================================
  // STATES - HISTÓRICO
  // ==========================================================

  const [primeiraMensagemId, setPrimeiraMensagemId] =
    useState<number | null>(null);

  const [temMaisMensagens, setTemMaisMensagens] =
    useState(true);

  const [carregandoHistorico, setCarregandoHistorico] =
    useState(false);



  // ==========================================================
  // STATES - BUSCA
  // ==========================================================

  const [busca, setBusca] = useState("");

  const [buscaMensagens, setBuscaMensagens] =
    useState("");

  const [mostrarBuscaMensagens, setMostrarBuscaMensagens] =
    useState(false);



  // ==========================================================
  // STATES - MENU
  // ==========================================================

  const [mostrarMenuAcoes, setMostrarMenuAcoes] =
    useState(false);

  const [mostrarPainelEmoji, setMostrarPainelEmoji] =
    useState(false);

  const [favoritos, setFavoritos] =
    useState<number[]>([]);



  // ==========================================================
  // STATES - SOLICITAÇÃO
  // ==========================================================

  const [modalSolicitacaoAberto, setModalSolicitacaoAberto] =
    useState(false);

  const [categoria, setCategoria] = useState("");

  const [categoriasPrestador, setCategoriasPrestador] =
    useState<string[]>([]);

  const [carregandoCategoriasPrestador,
    setCarregandoCategoriasPrestador] =
    useState(false);

  const [descricao, setDescricao] = useState("");

  const [dataServico, setDataServico] =
    useState("");

  const [endereco, setEndereco] =
    useState("");

  const [complementoSolicitacao,
    setComplementoSolicitacao] =
    useState("");

  const [fotos, setFotos] =
    useState<File[]>([]);

  const [erro, setErro] = useState("");



  // ==========================================================
  // STATES - SUPORTE
  // ==========================================================

  const [suporteAtivo, setSuporteAtivo] =
    useState(false);

  const [suporteTexto, setSuporteTexto] =
    useState("");

  const [suporteMensagens, setSuporteMensagens] =
    useState<MensagemSuporte[]>([]);

  const [carregandoSuporte, setCarregandoSuporte] =
    useState(false);

  const [enviandoSuporte, setEnviandoSuporte] =
    useState(false);



  // ==========================================================
  // STATES - DENÚNCIA
  // ==========================================================

  const [modalDenunciaAberto, setModalDenunciaAberto] =
    useState(false);

  const [denunciaEnviando, setDenunciaEnviando] =
    useState(false);

  const [denunciaMensagem, setDenunciaMensagem] =
    useState("");



  // ==========================================================
  // STATES - ANEXOS
  // ==========================================================

  const [anexoEmDestaque, setAnexoEmDestaque] =
    useState<ConteudoAnexo | null>(null);



  // ==========================================================
  // STATES - NOTIFICAÇÃO
  // ==========================================================

  const [notificacao, setNotificacao] = useState<{
    titulo: string;
    mensagem: string;
    tipo: "sucesso" | "erro" | "info";
  } | null>(null);



  // ==========================================================
  // REFS - INPUTS
  // ==========================================================

  const inputRef = useRef<HTMLInputElement>(null);
  const inputMensagemRef = useRef<HTMLInputElement>(null);
  const inputBuscaMensagemRef = useRef<HTMLInputElement>(null);
  const inputAnexoRef = useRef<HTMLInputElement>(null);



  // ==========================================================
  // REFS - CHAT
  // ==========================================================

  const listaMensagensRef = useRef<HTMLDivElement>(null);
  const fimMensagensRef = useRef<HTMLDivElement>(null);

  const primeiraCargaRef = useRef(true);
  const carregandoHistoricoRef = useRef(false);
  const buscandoNovasMensagensRef = useRef(false);
  const proximoTempIdRef = useRef(0);

  const chatSelecionadoRef = useRef<Chat | null>(null);
  const ultimoIdRecebidoRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioTimerRef = useRef<number | null>(null);
  const audioPreviewUrlRef = useRef("");
  const descartarAudioRef = useRef(false);
  const audioTempCounterRef = useRef(0);
  const anexoTempCounterRef = useRef(0);



  // ==========================================================
  // REFS - UI
  // ==========================================================

  const notificacaoTimerRef = useRef<number | null>(null);



  // ==========================================================
  // DADOS DA SESSÃO
  // ==========================================================

  const idUsuarioLogado = Number((session?.user as any)?.id ?? 0);

  const idPrestadorDireto =
    Number(searchParams.get("idPrestador") ?? 0);

  const isAdmin =
    (session?.user as any)?.isAdmin ?? false;

  const tipoParticipanteLogado:
    "usuario" | "prestador" | "admin" =
    isAdmin
      ? "admin"
      : (session?.user as any)?.isPrestador
      ? "prestador"
      : "usuario";

  const podeSolicitarServico = Boolean(
    !suporteAtivo &&
      chatSelecionado &&
      tipoParticipanteLogado === "usuario" &&
      !isAdmin &&
      Number(chatSelecionado.idPrestador) !==
        Number(idUsuarioLogado)
  );



  // ==========================================================
  // HELPERS - CHAT
  // ==========================================================

  const nomeChat = (chat: Chat) =>
    chat.nome?.trim() || `Conversa ${chat.idConversa}`;

  const fotoChat = (chat?: Chat | null) =>
    chat?.fotoPerfil?.trim() || "";

  const inicialChat = (chat?: Chat | null) =>
    (chat?.nome?.trim()?.[0] || "?").toUpperCase();

  const renderAvatarChat = (
    chat?: Chat | null,
    tamanho = "h-12 w-12"
  ) => {
    const foto = fotoChat(chat);

    return (
      <div
        className={`${tamanho} rounded-full bg-gray-300 shrink-0 overflow-hidden flex items-center justify-center`}
      >
        {foto ? (
          <img
            src={foto}
            alt={chat?.nome ? `Foto de ${chat.nome}` : "Foto do contato"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-gray-500">
            {inicialChat(chat)}
          </span>
        )}
      </div>
    );
  };



  // ==========================================================
  // HELPERS - NOTIFICAÇÕES
  // ==========================================================

  const exibirNotificacao = (
    titulo: string,
    mensagem: string,
    tipo: "sucesso" | "erro" | "info" = "info"
  ) => {
    if (notificacaoTimerRef.current) {
      window.clearTimeout(notificacaoTimerRef.current);
    }

    setNotificacao({
      titulo,
      mensagem,
      tipo,
    });

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



  // ==========================================================
  // HELPERS - SCROLL
  // ==========================================================

  const estaNoFimDaConversa = () => {
    const lista = listaMensagensRef.current;

    if (!lista) return false;

    return (
      lista.scrollHeight -
        lista.scrollTop -
        lista.clientHeight <
      80
    );
  };

  const irParaUltimaMensagem = () => {
    rolarParaFim();

    setNovasMensagensPendentes(0);
  };

  const rolarParaFim = (suave = false) => {
    if (!listaMensagensRef.current) return;

    listaMensagensRef.current.scrollTo({
      top: listaMensagensRef.current.scrollHeight,
      behavior: suave ? "smooth" : "auto",
    });

    setNovasMensagensPendentes(0);
  };



  // ==========================================================
  // HELPERS - ANEXOS
  // ==========================================================

  const obterLabelAnexo = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "Imagem";
    if (mimeType.startsWith("video/")) return "Vídeo";
    if (mimeType === "application/pdf") return "PDF";

    return "Arquivo";
  };

  const ehConteudoAnexo = (
    conteudo: string
  ): conteudo is string => {
    try {
      const parsed = JSON.parse(conteudo) as ConteudoAnexo;

      return Boolean(
        parsed &&
          parsed.url &&
          parsed.nome &&
          parsed.mimeType &&
          parsed.tipo
      );
    } catch {
      return false;
    }
  };

  const interpretarConteudo = (
    conteudo: string
  ): ConteudoAnexo | null => {
    try {
      const parsed = JSON.parse(conteudo) as ConteudoAnexo;

      if (
        !parsed ||
        !parsed.url ||
        !parsed.nome ||
        !parsed.mimeType ||
        !parsed.tipo
      ) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  };

  const anexoDaMensagem = (mensagem: Mensagem): ConteudoAnexo | null => {
    if (
      mensagem.tipo_mensagem === "imagem" ||
      mensagem.tipo_mensagem === "video" ||
      mensagem.tipo_mensagem === "documento"
    ) {
      const tipo =
        mensagem.tipo_mensagem === "imagem"
          ? "imagem"
          : mensagem.tipo_mensagem === "video"
            ? "video"
            : "pdf";
      return {
        tipo,
        nome: mensagem.conteudo || "Anexo",
        mimeType: mensagem.arquivo_mime || "application/octet-stream",
        url: mensagem.anexoLocalUrl || mensagem.arquivo_url || "",
      };
    }
    return ehConteudoAnexo(mensagem.conteudo)
      ? interpretarConteudo(mensagem.conteudo)
      : null;
  };

  const abrirAnexoEmDestaque = (
    anexo: ConteudoAnexo
  ) => {
    setAnexoEmDestaque(anexo);
  };

  const fecharAnexoEmDestaque = () => {
    setAnexoEmDestaque(null);
  };



  // ==========================================================
  // HELPERS - ARQUIVOS
  // ==========================================================

  const montarCategoriasDoPrestador = (dadosPrestador: any) => {
    const nomes = [
      ...(Array.isArray(dadosPrestador?.categorias_vinculadas)
        ? dadosPrestador.categorias_vinculadas.map((categoriaVinculada: CategoriaVinculada) =>
            categoriaVinculada.nome_categoria?.trim()
          )
        : []),
      dadosPrestador?.categoria_principal?.trim(),
    ].filter(Boolean) as string[];

    return Array.from(new Set(nomes));
  };



  // ==========================================================
  // FILTROS
  // ==========================================================

  const chatsFiltrados = listaChats.filter((chat) =>
    nomeChat(chat)
      .toLowerCase()
      .includes(busca.toLowerCase())
  );
  console.log(
    "CHAT SELECIONADO",
    chatSelecionado?.idConversa,
    chatSelecionado?.mensagens?.length
  );
  const mensagensFiltradas =
    chatSelecionado?.mensagens?.filter((msg) =>
      msg.conteudo
        .toLowerCase()
        .includes(buscaMensagens.toLowerCase())
  ) ?? [];



  // ==========================================================
  // AÇÕES DA INTERFACE
  // ==========================================================

  const alternarBuscaMensagens = () => {
    const vaiMostrarBusca = !mostrarBuscaMensagens;

    setMostrarBuscaMensagens(vaiMostrarBusca);
    setMostrarMenuAcoes(false);
    setMostrarPainelEmoji(false);

    if (vaiMostrarBusca) {
      setTimeout(() => inputBuscaMensagemRef.current?.focus(), 0);
    }
  };

  const abrirSuporte = async () => {
    setSuporteAtivo(true);
    setChatSelecionado(null);
    setMostrarMenuAcoes(false);
    setMostrarPainelEmoji(false);
    await carregarSuporte();
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

  const handleScroll = () => {

    if (!listaMensagensRef.current) return;

    console.log(
      "scrollTop:",
      listaMensagensRef.current.scrollTop,
      "programatico?",
      carregandoHistoricoRef.current
    );

    if (primeiraCargaRef.current) {
      return;
    }

    if (mostrarBuscaMensagens) {
      return;
    }

    if (listaMensagensRef.current.scrollTop < 40) {
      console.log(">>>> carregarHistorico()");
      carregarHistorico();
    }
  };

  const handleFotos = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const arquivos = Array.from(e.target.files || []);

    const novasFotos = [...fotos, ...arquivos].slice(0, 5);

    setFotos(novasFotos);
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

  const denunciarConversa = async () => {
    if (!chatSelecionado) return;

    setModalDenunciaAberto(true);
  };

  const inserirEmoji = (emoji: string) => {
    setNovaMensagem((anterior) => `${anterior}${emoji}`);
    setMostrarPainelEmoji(false);
    inputMensagemRef.current?.focus();
  };



  // ==========================================================
  // API - CONVERSAS
  // ==========================================================

  const carregarConversas = async () => {
    console.log("ENTROU carregarConversas");

    if (!idUsuarioLogado) {
      console.log("SEM USUARIO");
      return;
    }

    try {
      const response = await fetch(
        `/api/conversas?idParticipante=${idUsuarioLogado}&tipoParticipante=${isAdmin ? "admin" : tipoParticipanteLogado}`
      );

      const dados = await response.json();
      console.log(dados);
      setListaChats(Array.isArray(dados) ? dados : []);

      if (Array.isArray(dados) && dados.length > 0 && !chatSelecionado) {
        setChatSelecionado(dados[0]);
        carregarMensagens(dados[0].idConversa);
      }

    } catch (error) {
      console.error(error);
    }
  };



  // ==========================================================
  // API - MENSAGENS
  // ==========================================================

  const carregarMensagens = async (idConversa: number) => {
    console.log("CARREGANDO CONVERSA", idConversa);
    try {
      const response = await fetch(
        `/api/mensagens?idConversa=${idConversa}&limit=30`
      );

      const mensagens: Mensagem[] = await response.json();

      console.log(
        "carregarMensagens:",
        mensagens.map((m) => m.idMensagem)
      );

      if (!response.ok) {
      console.error("Erro da API:", mensagens);
      return;
    }

    if (!Array.isArray(mensagens)) {
      console.error("Resposta inesperada da API:", mensagens);
      return;
    }

      setPrimeiraMensagemId(
          mensagens.length > 0
              ? mensagens[0].idMensagem
              : null
      );

      setTemMaisMensagens(mensagens.length >= 30);

      const chatBase = listaChats.find(
          (c) => c.idConversa === idConversa
      );

      if (chatBase) {
          setChatSelecionado(chatBase);
      }

      const ultimo =
        mensagens.length > 0
          ? mensagens[mensagens.length - 1].idMensagem
          : 0;

      console.log("SETANDO ultimoId:", ultimo);

      setUltimoIdRecebido(ultimo);

      /*
      setListaChats((anterior) =>
        anterior.map((chat) =>
          chat.idConversa === idConversa
            ? { ...chat, mensagens }
            : chat
        )
      );
      */
      console.log(
        "Atualizando lista",
        idConversa,
        listaChats.map(c => c.idConversa)
      );

      setListaChats((anterior) =>
        anterior.map((chat) =>
          chat.idConversa === idConversa ? { ...chat, mensagens } : chat
        )
      );

      setChatSelecionado((anterior) =>
        anterior && anterior.idConversa === idConversa
          ? { ...anterior, mensagens }
          : anterior
      );

      console.log("SCROLL carregarMensagens");

      if (listaMensagensRef.current) {
        listaMensagensRef.current.scrollTop =
          listaMensagensRef.current.scrollHeight;
      }

      primeiraCargaRef.current = false;


    } catch (error) {
      console.error(error);
    }
  };

  const carregarHistorico = async () => {

    if (
      !chatSelecionado ||
      !primeiraMensagemId ||
      carregandoHistorico ||
      !temMaisMensagens
    ) {
      return;
    }

    setCarregandoHistorico(true);

    const elemento = listaMensagensRef.current;
    const alturaAnterior = elemento?.scrollHeight ?? 0;

    try {

      carregandoHistoricoRef.current = true;
      console.log("CARREGOU HISTÓRICO");
      const response = await fetch(
        `/api/mensagens?idConversa=${chatSelecionado.idConversa}&beforeId=${primeiraMensagemId}&limit=30`
      );

      const historico: Mensagem[] = await response.json();

      if (!Array.isArray(historico) || historico.length === 0) {
        setTemMaisMensagens(false);
        return;
      }

      setPrimeiraMensagemId(historico[0].idMensagem);

      if (historico.length < 30) {
        setTemMaisMensagens(false);
      }

      setListaChats((anterior) =>
        anterior.map((chat) => {
          if (chat.idConversa !== chatSelecionado.idConversa) return chat;

          const mensagens = mesclarMensagens(historico, chat.mensagens ?? []);

          return { ...chat, mensagens };
        })
      );

      setChatSelecionado((anterior) => {
        if (!anterior) return anterior;

        const mensagens = mesclarMensagens(historico, anterior.mensagens ?? []);

        return {
          ...anterior,
          mensagens,
        };
      });

      requestAnimationFrame(() => {
        if (!listaMensagensRef.current) return;

        const novaAltura = listaMensagensRef.current.scrollHeight;

        listaMensagensRef.current.scrollTop =
          novaAltura - alturaAnterior;
      });

    } finally {
      setCarregandoHistorico(false);

      setTimeout(() => {
        carregandoHistoricoRef.current = false;
      }, 0);
    }
  };

  const carregarNovasMensagens = async (idConversa: number, afterId: number) => {
    try {
      if (buscandoNovasMensagensRef.current) {
        return;
      }

      buscandoNovasMensagensRef.current = true;

      const response = await fetch(
        `/api/mensagens?idConversa=${idConversa}&afterId=${afterId}`
      );

      const novas: Mensagem[] = await response.json();

      if (!response.ok || !Array.isArray(novas) || novas.length === 0) {
        return;
      }

      setUltimoIdRecebido(
        novas[novas.length - 1].idMensagem
      );

      const usuarioEstavaNoFim = estaNoFimDaConversa();
      setListaChats((anterior) =>
        anterior.map((chat) => {
          if (chat.idConversa !== idConversa) return chat;
          const montagem = mesclarMensagens(chat.mensagens ?? [], novas);
          return { ...chat, mensagens: montagem };
        })
      );



      setChatSelecionado((anterior) => {
        if (!anterior || anterior.idConversa !== idConversa) return anterior;
        return {
          ...anterior,
          mensagens: mesclarMensagens(anterior.mensagens ?? [], novas),
        };
      });
      if (usuarioEstavaNoFim) {
        rolarParaFim();
        setNovasMensagensPendentes(0);
      } else {
        setNovasMensagensPendentes((valor) => valor + novas.length);
      }

      requestAnimationFrame(() => {
        const container = listaMensagensRef.current;

        if (!container) return;

        const distanciaDoFim =
          container.scrollHeight -
          container.scrollTop -
          container.clientHeight;

        // só desce automaticamente se o usuário já estiver perto do fim
        if (distanciaDoFim < 150) {
          rolarParaFim();
        }
      });

      const mensagensNaoLidas = novas.filter(
        (msg) =>
          msg.idRemetente !== idUsuarioLogado &&
          chatSelecionado?.idConversa !== idConversa
      );

      if (mensagensNaoLidas.length > 0) {
        setContadorNovasMensagens((anterior) => ({
          ...anterior,
          [idConversa]:
            (anterior[idConversa] ?? 0) + mensagensNaoLidas.length,
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      buscandoNovasMensagensRef.current = false;
    }
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim()) return;

    if (!chatSelecionado) return;

    proximoTempIdRef.current += 1;
    const tempNumericId = proximoTempIdRef.current;
    const tempId = `temp-${idUsuarioLogado}-${tempNumericId}`;

    const mensagemTemporaria: Mensagem = {
      idMensagem: -tempNumericId,
      tempId,
      idConversa: chatSelecionado.idConversa,
      idRemetente: idUsuarioLogado,
      conteudo: novaMensagem,
      criadoEm: new Date().toISOString(),
      lida: false,
      enviando: true,
    };

    setChatSelecionado((anterior) => {
      if (!anterior) return anterior;

      return {
        ...anterior,
        mensagens: [...(anterior.mensagens ?? []), mensagemTemporaria],
      };
    });

    setListaChats((anterior) =>
      anterior.map((chat) =>
        chat.idConversa === chatSelecionado.idConversa
          ? {
              ...chat,
              mensagens: [...(chat.mensagens ?? []), mensagemTemporaria],
            }
          : chat
      )
    );

    setNovaMensagem("");

    requestAnimationFrame(() => {
        rolarParaFim();
    });

    try {
      const response = await fetch("/api/mensagens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idConversa: chatSelecionado.idConversa,
          conteudo: novaMensagem,
          clientTempId: tempId,
        }),
      });

      const mensagemReal = await response.json();
      if (!response.ok) {
        throw new Error(mensagemReal.erro ?? "Erro ao enviar");
      }

      setUltimoIdRecebido((atual) => Math.max(atual, mensagemReal.idMensagem));

      setChatSelecionado((anterior) => {
        if (!anterior) return anterior;

        return {
          ...anterior,
          mensagens: mesclarMensagens(
            (anterior.mensagens ?? []).filter((msg) => msg.tempId !== tempId),
            [mensagemReal]
          ),
        };
      });

      setListaChats((anterior) =>
        anterior.map((chat) =>
          chat.idConversa === chatSelecionado.idConversa
            ? {
                ...chat,
                mensagens: mesclarMensagens(
                  (chat.mensagens ?? []).filter((msg) => msg.tempId !== tempId),
                  [mensagemReal]
                ),
              }
            : chat
        )
      );

      setUltimoIdRecebido((atual) => Math.max(atual, mensagemReal.idMensagem));
      await carregarNovasMensagens(
        chatSelecionado.idConversa,
        mensagemReal.idMensagem
      );

    } catch (error) {
      setChatSelecionado((anterior) => {
        if (!anterior) return anterior;

        return {
          ...anterior,
          mensagens: anterior.mensagens?.map((msg) =>
            msg.tempId === tempId
              ? {
                  ...msg,
                  enviando: false,
                  erro: true,
                }
              : msg
          ),
        };
      });

      setListaChats((anterior) =>
        anterior.map((chat) =>
          chat.idConversa === chatSelecionado.idConversa
            ? {
                ...chat,
                mensagens: chat.mensagens?.map((msg) =>
                  msg.tempId === tempId
                    ? {
                        ...msg,
                        enviando: false,
                        erro: true,
                      }
                    : msg
                ),
              }
            : chat
        )
      );

      console.error(error);

      exibirNotificacao(
        "Falha ao enviar",
        "Não foi possível enviar a mensagem agora.",
        "erro"
      );
    }
  };

  const tentarEnviarNovamente = async (mensagem: Mensagem) => {
    if (!mensagem.tempId || !mensagem.erro) return;

    const atualizarTemporaria = (patch: Partial<Mensagem>) => {
      setChatSelecionado((anterior) =>
        anterior
          ? {
              ...anterior,
              mensagens: anterior.mensagens?.map((item) =>
                item.tempId === mensagem.tempId ? { ...item, ...patch } : item
              ),
            }
          : anterior
      );
      setListaChats((anterior) =>
        anterior.map((chat) =>
          chat.idConversa === mensagem.idConversa
            ? {
                ...chat,
                mensagens: chat.mensagens?.map((item) =>
                  item.tempId === mensagem.tempId ? { ...item, ...patch } : item
                ),
              }
            : chat
        )
      );
    };

    atualizarTemporaria({ enviando: true, erro: false });

    try {
      const response = await fetch('/api/mensagens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idConversa: mensagem.idConversa,
          conteudo: mensagem.conteudo,
          clientTempId: mensagem.tempId,
        }),
      });
      const confirmada = await response.json();
      if (!response.ok) throw new Error(confirmada.erro ?? 'Erro ao reenviar');

      setUltimoIdRecebido((atual) => Math.max(atual, confirmada.idMensagem));
      setChatSelecionado((anterior) =>
        anterior
          ? {
              ...anterior,
              mensagens: mesclarMensagens(
                (anterior.mensagens ?? []).filter((item) => item.tempId !== mensagem.tempId),
                [confirmada]
              ),
            }
          : anterior
      );
      setListaChats((anterior) =>
        anterior.map((chat) =>
          chat.idConversa === mensagem.idConversa
            ? {
                ...chat,
                mensagens: mesclarMensagens(
                  (chat.mensagens ?? []).filter((item) => item.tempId !== mensagem.tempId),
                  [confirmada]
                ),
              }
            : chat
        )
      );
    } catch {
      atualizarTemporaria({ enviando: false, erro: true });
      exibirNotificacao('Falha ao reenviar', 'Verifique a conexão e tente novamente.', 'erro');
    }
  };

  const encerrarStreamAudio = () => {
    audioStreamRef.current?.getTracks().forEach((track) => track.stop());
    audioStreamRef.current = null;
    if (audioTimerRef.current) {
      window.clearInterval(audioTimerRef.current);
      audioTimerRef.current = null;
    }
  };

  const limparGravacaoAudio = () => {
    encerrarStreamAudio();
    if (audioPreviewUrlRef.current) URL.revokeObjectURL(audioPreviewUrlRef.current);
    audioPreviewUrlRef.current = "";
    setAudioPreviewUrl("");
    setAudioBlob(null);
    setAudioSegundos(0);
    setEstadoAudio("idle");
  };

  const escolherMimeAudio = () => {
    const formatos = ["audio/webm", "audio/ogg", "audio/mp4"];
    return formatos.find((formato) => MediaRecorder.isTypeSupported(formato)) ?? "";
  };

  const iniciarGravacaoAudio = async () => {
    if (!chatSelecionado || suporteAtivo || estadoAudio !== "idle") return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      exibirNotificacao("Áudio indisponível", "Este navegador não oferece gravação de áudio.", "erro");
      return;
    }

    setEstadoAudio("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = escolherMimeAudio();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      audioStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      descartarAudioRef.current = false;
      setAudioSegundos(0);

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      });
      recorder.addEventListener("stop", () => {
        encerrarStreamAudio();
        if (descartarAudioRef.current) {
          descartarAudioRef.current = false;
          audioChunksRef.current = [];
          setEstadoAudio("idle");
          return;
        }

        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || mimeType || "audio/webm",
        });
        audioChunksRef.current = [];
        if (!blob.size) {
          setEstadoAudio("error");
          exibirNotificacao("Gravação vazia", "Não foi possível capturar o áudio.", "erro");
          return;
        }

        const previewUrl = URL.createObjectURL(blob);
        audioPreviewUrlRef.current = previewUrl;
        setAudioBlob(blob);
        setAudioPreviewUrl(previewUrl);
        setEstadoAudio("preview");
      });

      recorder.start(250);
      setEstadoAudio("recording");
      audioTimerRef.current = window.setInterval(() => {
        setAudioSegundos((segundos) => {
          if (segundos >= 119) {
            mediaRecorderRef.current?.stop();
            return 120;
          }
          return segundos + 1;
        });
      }, 1000);
    } catch (error) {
      encerrarStreamAudio();
      setEstadoAudio("idle");
      const negado =
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "PermissionDeniedError");
      exibirNotificacao(
        negado ? "Microfone bloqueado" : "Falha no microfone",
        negado
          ? "Permita o acesso ao microfone nas configurações do navegador."
          : "Não foi possível iniciar a gravação.",
        "erro"
      );
    }
  };

  const finalizarGravacaoAudio = () => {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
  };

  const cancelarGravacaoAudio = () => {
    descartarAudioRef.current = true;
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      limparGravacaoAudio();
    }
  };

  const salvarMensagemNoEstado = (mensagem: Mensagem, tempId: string) => {
    setListaChats((anterior) =>
      anterior.map((chat) =>
        chat.idConversa === mensagem.idConversa
          ? {
              ...chat,
              mensagens: mesclarMensagens(
                (chat.mensagens ?? []).filter((item) => item.tempId !== tempId),
                [mensagem]
              ),
            }
          : chat
      )
    );
    setChatSelecionado((anterior) =>
      anterior?.idConversa === mensagem.idConversa
        ? {
            ...anterior,
            mensagens: mesclarMensagens(
              (anterior.mensagens ?? []).filter((item) => item.tempId !== tempId),
              [mensagem]
            ),
          }
        : anterior
    );
  };

  const enviarAudio = async (blob = audioBlob, tempIdExistente?: string) => {
    if (!blob || !chatSelecionado) return;

    audioTempCounterRef.current += 1;
    const tempId = tempIdExistente ?? `audio-${idUsuarioLogado}-${audioTempCounterRef.current}`;
    const mimeType = blob.type.split(";")[0].toLowerCase();
    const extensao =
      mimeType === "audio/ogg" ? "ogg" :
      mimeType === "audio/mp4" ? "m4a" :
      mimeType === "audio/mpeg" ? "mp3" :
      mimeType === "audio/wav" ? "wav" : "webm";
    const localUrl = audioPreviewUrl || URL.createObjectURL(blob);

    const temporaria: Mensagem = {
      idMensagem: -audioTempCounterRef.current,
      idConversa: chatSelecionado.idConversa,
      idRemetente: idUsuarioLogado,
      conteudo: "[Áudio]",
      criadoEm: new Date().toISOString(),
      lida: false,
      tipo_mensagem: "audio",
      arquivo_mime: mimeType,
      audio_duracao: audioSegundos,
      tempId,
      enviando: true,
      audioLocalUrl: localUrl,
      audioBlob: blob,
    };
    salvarMensagemNoEstado(temporaria, tempId);
    setEstadoAudio("sending");
    requestAnimationFrame(() => rolarParaFim(true));

    try {
      const formData = new FormData();
      formData.append("idConversa", String(chatSelecionado.idConversa));
      formData.append("clientTempId", tempId);
      formData.append("audio", new File([blob], `audio.${extensao}`, { type: mimeType }));

      const response = await fetch("/api/mensagens/audio", { method: "POST", body: formData });
      const confirmada = await response.json();
      if (!response.ok) throw new Error(confirmada.erro || "Não foi possível enviar o áudio.");

      salvarMensagemNoEstado(confirmada, tempId);
      limparGravacaoAudio();
      exibirNotificacao("Áudio enviado", "A mensagem de áudio foi enviada.", "sucesso");
    } catch (error) {
      salvarMensagemNoEstado({ ...temporaria, enviando: false, erro: true }, tempId);
      setEstadoAudio("error");
      exibirNotificacao(
        "Falha ao enviar",
        error instanceof Error ? error.message : "Tente novamente em instantes.",
        "erro"
      );
    }
  };

  const tentarReenviarAudio = (mensagem: Mensagem) => {
    if (mensagem.audioBlob && mensagem.tempId) {
      enviarAudio(mensagem.audioBlob, mensagem.tempId);
    }
  };

  const tipoMensagemDoArquivo = (
    mimeType: string
  ): "imagem" | "video" | "documento" => {
    if (mimeType.startsWith("image/")) return "imagem";
    if (mimeType.startsWith("video/")) return "video";
    return "documento";
  };

  const enviarAnexo = async (arquivo: File, tempIdExistente?: string) => {
    if (!chatSelecionado) return;

    const formatosPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "application/pdf",
    ];
    if (!formatosPermitidos.includes(arquivo.type)) {
      exibirNotificacao(
        "Formato não permitido",
        "Envie uma imagem JPG, PNG ou WebP, um vídeo MP4 ou WebM, ou um PDF.",
        "erro"
      );
      return;
    }
    if (arquivo.size > 10 * 1024 * 1024) {
      exibirNotificacao("Arquivo muito grande", "O limite por anexo é de 10 MB.", "erro");
      return;
    }

    anexoTempCounterRef.current += 1;
    const tempId =
      tempIdExistente ??
      `anexo-${idUsuarioLogado}-${anexoTempCounterRef.current}`;
    const localUrl = URL.createObjectURL(arquivo);
    const tipoMensagem = tipoMensagemDoArquivo(arquivo.type);
    const temporaria: Mensagem = {
      idMensagem: -1000000 - anexoTempCounterRef.current,
      idConversa: chatSelecionado.idConversa,
      idRemetente: idUsuarioLogado,
      conteudo: arquivo.name,
      criadoEm: new Date().toISOString(),
      lida: false,
      tipo_mensagem: tipoMensagem,
      arquivo_mime: arquivo.type,
      arquivo_tamanho: arquivo.size,
      anexoArquivo: arquivo,
      anexoLocalUrl: localUrl,
      tempId,
      enviando: true,
    };
    salvarMensagemNoEstado(temporaria, tempId);
    requestAnimationFrame(() => rolarParaFim(true));

    try {
      const formData = new FormData();
      formData.append("idConversa", String(chatSelecionado.idConversa));
      formData.append("clientTempId", tempId);
      formData.append("arquivo", arquivo);

      const response = await fetch("/api/mensagens/anexo", {
        method: "POST",
        body: formData,
      });
      const confirmada = await response.json();
      if (!response.ok) {
        throw new Error(confirmada.erro || "Não foi possível enviar o anexo.");
      }

      salvarMensagemNoEstado(confirmada, tempId);
      URL.revokeObjectURL(localUrl);
      exibirNotificacao("Anexo enviado", "O arquivo foi enviado com segurança.", "sucesso");
    } catch (error) {
      salvarMensagemNoEstado({ ...temporaria, enviando: false, erro: true }, tempId);
      exibirNotificacao(
        "Falha ao enviar",
        error instanceof Error ? error.message : "Tente novamente em instantes.",
        "erro"
      );
    } finally {
      if (inputAnexoRef.current) inputAnexoRef.current.value = "";
    }
  };

  const tentarReenviarAnexo = (mensagem: Mensagem) => {
    if (mensagem.anexoArquivo && mensagem.tempId) {
      enviarAnexo(mensagem.anexoArquivo, mensagem.tempId);
    }
  };

  useEffect(() => {
    return () => {
      audioStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioTimerRef.current) window.clearInterval(audioTimerRef.current);
      if (audioPreviewUrlRef.current) URL.revokeObjectURL(audioPreviewUrlRef.current);
    };
  }, []);

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



  // ==========================================================
  // API - SOLICITAÇÃO
  // ==========================================================

  const enviarSolicitacao = async () => {

    if (!chatSelecionado) {
      setErro("Selecione uma conversa para solicitar o serviço.");
      return;
    }

    if (!idUsuarioLogado) {
      setErro("Faça login para solicitar um serviço.");
      return;
    }

    if (isAdmin || Number(chatSelecionado.idPrestador) === Number(idUsuarioLogado)) {
      setErro("Esta conversa não permite solicitar serviço.");
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



  // ==========================================================
  // API - SUPORTE
  // ==========================================================

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



  // ==========================================================
  // API - DENÚNCIA
  // ==========================================================

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



  // ==========================================================
  // USE EFFECTS - REFS
  // ==========================================================

  useEffect(() => {
    chatSelecionadoRef.current = chatSelecionado;
  }, [chatSelecionado]);

  useEffect(() => {
    ultimoIdRecebidoRef.current = ultimoIdRecebido;
  }, [ultimoIdRecebido]);



  // ==========================================================
  // USE EFFECTS - LIMPEZA
  // ==========================================================

  useEffect(() => {
    return () => {
      if (notificacaoTimerRef.current) {
        window.clearTimeout(notificacaoTimerRef.current);
      }
    };
  }, []);



  // ==========================================================
  // USE EFFECTS - PRIMEIRA CARGA
  // ==========================================================

  useEffect(() => {
    carregarConversas();
  }, [idUsuarioLogado, tipoParticipanteLogado]);



  // ==========================================================
  // USE EFFECTS - CONVERSA DIRETA
  // ==========================================================

  useEffect(() => {
    const abrirConversaDireta = async () => {
      if (chatDiretoProcessado) return;
      if (!idPrestadorDireto || idPrestadorDireto <= 0) return;
      if (!idUsuarioLogado || isAdmin) return;

      if (idPrestadorDireto === idUsuarioLogado) {
        setChatDiretoProcessado(true);
        return;
      }

      try {
        const criarResponse = await fetch("/api/conversas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idUsuario: idUsuarioLogado,
            idPrestador: idPrestadorDireto,
          }),
        });

        const conversaCriada = await criarResponse.json();

        if (!criarResponse.ok) {
          throw new Error(
            conversaCriada?.erro ||
              "Não foi possível abrir a conversa.");
        }

        const listaResponse = await fetch(
          `/api/conversas?idParticipante=${idUsuarioLogado}&tipoParticipante=${tipoParticipanteLogado}`
        );

        const lista = await listaResponse.json();

        const chats = Array.isArray(lista)
          ? lista
          : [];

        setListaChats(chats);

        const idConversaAlvo = Number(
          conversaCriada?.idConversa ?? 0
        );

        const conversaAlvo =
          chats.find(
            (chat: Chat) =>
                Number(chat.idConversa) ===
                idConversaAlvo
          ) ||
          chats.find(
            (chat: Chat) =>
                Number(chat.idPrestador) ===
                idPrestadorDireto
          );

        if (conversaAlvo) {
          setSuporteAtivo(false);
          primeiraCargaRef.current = true;

          setChatSelecionado(conversaAlvo);

          await carregarMensagens(conversaAlvo.idConversa);
        }

        setChatDiretoProcessado(true);
      } catch (error) {
        console.error(error);
        setChatDiretoProcessado(true);
      }
    };

    abrirConversaDireta();
  }, [
      chatDiretoProcessado,
      idPrestadorDireto,
      idUsuarioLogado,
      tipoParticipanteLogado,
  ]);



  // ==========================================================
  // USE EFFECTS - VISIBILIDADE
  // ==========================================================

  useEffect(() => {
    const handleVisibility = () => {
      setAbaVisivel(!document.hidden);
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    handleVisibility();

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);
  /*
  useEffect(() => {
    if (!abaVisivel) return;
    if (!chatSelecionado) return;
    if (suporteAtivo) return;
    if (!ultimoIdRecebido) return;

    carregarNovasMensagens(
      chatSelecionado.idConversa,
      ultimoIdRecebido
    );
  }, [
    abaVisivel,
    chatSelecionado?.idConversa,
    suporteAtivo,
  ]);
  */


  // ==========================================================
  // USE EFFECTS - POLLING
  // ==========================================================

  useEffect(() => {
    if (!chatSelecionado || suporteAtivo || !abaVisivel) return;

    const intervalo = window.setInterval(() => {

      const chat = chatSelecionadoRef.current;

      if (!chat) return;
      carregarNovasMensagens(
        chat.idConversa,
        ultimoIdRecebidoRef.current
      );

      // sincronizarMensagens(chat.idConversa);
    }, 7000);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [
    chatSelecionado?.idConversa,
    suporteAtivo,
    abaVisivel,
  ]);

  useEffect(() => {
    if (!abaVisivel || suporteAtivo || !chatSelecionado) return;
    carregarNovasMensagens(chatSelecionado.idConversa, ultimoIdRecebidoRef.current);
  }, [abaVisivel, chatSelecionado?.idConversa, suporteAtivo]);



  // ==========================================================
  // USE EFFECTS - SUPORTE
  // ==========================================================

  useEffect(() => {
    if (
      !modalSolicitacaoAberto ||
      !chatSelecionado?.idPrestador ||
      suporteAtivo
    ) {
      return;
    }

    let ativo = true;

    const carregarCategoriasPrestador = async () => {
      setCarregandoCategoriasPrestador(true);
      setCategoriasPrestador([]);

      try {
        const response = await fetch(
          `/api/prestador/${chatSelecionado.idPrestador}`
        );

        const dadosPrestador = await response.json();

        if (!response.ok) {
          throw new Error(
            dadosPrestador?.erro ||
              "Não foi possível carregar as categorias do prestador."
          );
        }

        const categorias =
          montarCategoriasDoPrestador(dadosPrestador);

        if (!ativo) return;

        setCategoriasPrestador(categorias);

        setCategoria((categoriaAtual) =>
          categoriaAtual &&
          categorias.includes(categoriaAtual)
            ? categoriaAtual
            : ""
        );
      } catch (error) {
        console.error(error);

        if (ativo) {
          setCategoriasPrestador([]);
          setCategoria("");
        }
      } finally {
        if (ativo) {
          setCarregandoCategoriasPrestador(false);
        }
      }
    };

    carregarCategoriasPrestador();

    return () => {
      ativo = false;
    };
  }, [
    modalSolicitacaoAberto,
    chatSelecionado?.idPrestador,
    suporteAtivo,
  ]);



  useEffect(() => {
    if (!primeiraCargaRef.current) return;
    if (!chatSelecionado?.mensagens?.length) return;

    console.log("LAYOUT EFFECT SCROLL");

    if (listaMensagensRef.current) {
      listaMensagensRef.current.scrollTop =
        listaMensagensRef.current.scrollHeight;
    }

    primeiraCargaRef.current = false;
  }, [
    chatSelecionado?.idConversa,
    chatSelecionado?.mensagens?.length,
  ]);










  console.log(
    "LISTA",
    listaChats.map(c => ({
      id: c.idConversa,
      msgs: c.mensagens?.length
    }))
  );


  console.log(
    "RENDER",
    chatSelecionado?.idConversa,
    chatSelecionado?.mensagens?.length
  );
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
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-3 py-3 md:px-6 md:py-4">
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
        <aside
          className={`
            border-r border-[#CDCDCD] bg-white flex flex-col
            w-full md:w-[25%] md:min-w-[260px] md:max-w-[340px]
            ${mostrarListaMobile ? "flex" : "hidden"}
            md:flex
          `}
        >
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
              onClick={async () => {
                console.log(
                  "CLICK",
                  chat.idConversa,
                  chat.mensagens?.length
                );
                primeiraCargaRef.current = true;
                setSuporteAtivo(false);
                setChatSelecionado(chat);
                setMostrarListaMobile(false);
                setContadorNovasMensagens((anterior) => ({ ...anterior, [chat.idConversa]: 0 }));
                await carregarMensagens(chat.idConversa);
              }}
              className={`
                flex gap-3 px-4 py-4 border-b border-[#CDCDCD]
                cursor-pointer
                hover:bg-[#F7F7F7]
                ${chatSelecionado?.idConversa === chat.idConversa ? "bg-blue-50" : ""}
              `}>
                {renderAvatarChat(chat)}

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <h3 className="font-medium text-sm truncate">
                      {nomeChat(chat)}
                    </h3>

                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(chat.ultimaMensagemEm).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-sm text-gray-500 truncate">
                      {chat.mensagens?.[chat.mensagens.length - 1]?.conteudo}
                    </p>
                    {(contadorNovasMensagens[chat.idConversa] ?? 0) > 0 ? (
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                        {contadorNovasMensagens[chat.idConversa]}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contato fixo */}
          <div className="border-t border-[#CDCDCD] bg-white shrink-0">
            <div
              onClick={() => {
                abrirSuporte();
                setMostrarListaMobile(false);
              }}
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
        <section

          className={`
            flex-1 flex-col bg-white min-w-0
            ${
              !mostrarListaMobile && (chatSelecionado || suporteAtivo)
                ? "flex"
                : "hidden md:flex"
            }
          `}
        >

          {/* Header da conversa */}
          <div className="h-20 border-b border-[#CDCDCD] px-3 md:px-6 flex items-center justify-between gap-2">

            <div className="flex items-center gap-2 min-w-0 flex-1">

              <button
                onClick={() => {
                  setChatSelecionado(null);
                  setMostrarListaMobile(true);
                  setMostrarBuscaMensagens(false);
                  setMostrarMenuAcoes(false);
                  setMostrarPainelEmoji(false);
                  setBuscaMensagens("");
                }}
                className="
                  md:hidden
                  flex items-center justify-center
                  w-10 h-10
                  rounded-full
                  hover:bg-blue-50
                  active:scale-95
                  transition
                  cursor-pointer
                "
                aria-label="Voltar para conversas"
              >
                <ArrowLeft
                  size={22}
                  color="#2563EB"
                  strokeWidth={2.5}
                />
              </button>

              {suporteAtivo ? (
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={logo.src}
                    alt="Suporte"
                    className="w-8 h-8 object-contain"
                  />
                </div>
              ) : (
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full shrink-0 flex items-center justify-center overflow-hidden">
                  {renderAvatarChat(chatSelecionado)}
                </div>
              )}


              <div className="min-w-0">
                <h2 className="font-semibold text-sm md:text-[15px] truncate">
                  {suporteAtivo ? "Suporte Benvi" : (chatSelecionado?.nome ?? "Selecione uma conversa")}
                </h2>

                <p className="text-xs md:text-sm text-gray-500 truncate">
                  {suporteAtivo
                    ? "Administrador"
                    : tipoParticipanteLogado === "prestador"
                    ? "Cliente"
                    : "Prestador"}
                </p>
              </div>

              {podeSolicitarServico && (
              <button  onClick={() => setModalSolicitacaoAberto(true)}
              className="hidden md:block ml-3 bg-[#2F80ED] text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600 cursor-pointer">
                Solicitar serviço
              </button>
              )}

            </div>

            {/* Lado direito */}
            {!suporteAtivo && (
            <div className="flex items-center gap-1 md:gap-3 shrink-0">

              <button
                onClick={alternarFavorito}
                className="hidden md:block p-2 rounded-full hover:bg-blue-200 cursor-pointer"
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
                    <div className="md:hidden">
                      {podeSolicitarServico && (
                        <button
                          onClick={() => {
                            setModalSolicitacaoAberto(true);
                            setMostrarMenuAcoes(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          <Plus size={16} />
                          Solicitar serviço
                        </button>
                      )}
                      <button
                        onClick={() => {
                          alternarFavorito();
                          setMostrarMenuAcoes(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        <Star
                          size={16}
                          fill={
                            chatSelecionado && favoritos.includes(chatSelecionado.idConversa)
                              ? "blue"
                              : "none"
                          }
                          color="blue"
                        />
                        {chatSelecionado && favoritos.includes(chatSelecionado.idConversa)
                          ? "Remover dos favoritos"
                          : "Adicionar aos favoritos"}
                      </button>
                    </div>

                    <button
                      onClick={() => executarAcaoMenu("recarregar")}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      <RotateCw size={16} />
                      Recarregar mensagens
                    </button>

                    <button
                      onClick={() => executarAcaoMenu("limpar")}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      <Eraser size={16} />
                      Limpar campo
                    </button>

                    <div className="md:hidden">
                      <button
                        onClick={() => {
                          denunciarConversa();
                          setMostrarMenuAcoes(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <AlertTriangle size={16} />
                        Denunciar conversa
                      </button>
                    </div>

                    <hr className="border-t border-[#CDCDCD]" />

                    <button
                      onClick={() => executarAcaoMenu("fechar")}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <XCircle size={16} />
                      Fechar conversa
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={denunciarConversa}
                className="hidden md:block p-2 rounded-full hover:bg-red-200 cursor-pointer"
              >
                <AlertTriangle color="red" size={20} />
              </button>

            </div>
            )}
          </div>


          {/* Barra de busca */}
          {mostrarBuscaMensagens && (
              <div className="border-b border-[#CDCDCD] bg-white px-6 py-3 shrink-0">
                <input
                  ref={inputBuscaMensagemRef}
                  value={buscaMensagens}
                  onChange={(e) => setBuscaMensagens(e.target.value)}
                  placeholder="Buscar nesta conversa..."
                  className="w-full rounded-full border border-[#CDCDCD] px-4 py-2 outline-none"
                />
              </div>
            )}


          {/* Mensagens */}
          <div
          ref={listaMensagensRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-[#FAFAFA] px-3 py-3 md:px-8 md:py-6">


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
                  <div key={mensagem.id} className={`mb-3 md:mb-5 flex ${mensagem.lado === "usuario" ? "justify-end" : "justify-start"}`}>
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
            {carregandoHistorico && (
                <div className="py-3 text-center text-sm text-gray-500">
                    Carregando mensagens...
                </div>
            )}
            {!suporteAtivo && mensagensFiltradas.map((msg) => {

              const enviadaPorMim = msg.idRemetente === idUsuarioLogado;
              const mensagemAudio = msg.tipo_mensagem === "audio";
              const anexo = anexoDaMensagem(msg);
              const textoMensagem = anexo ? null : msg.conteudo;

              return (
                <div
                  key={msg.tempId ?? msg.idMensagem}
                  className={`mb-3 md:mb-5 flex ${
                    enviadaPorMim
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] md:max-w-[60%] px-4 py-2.5 md:px-5 md:py-3 rounded-2xl ${
                      enviadaPorMim
                        ? "bg-[#2F80ED] text-white rounded-br-none"
                        : "bg-[#DCE6FF] text-[#333] rounded-bl-none"
                    }`}
                  >
                    {mensagemAudio ? (
                      <div className="min-w-[220px] max-w-full space-y-2">
                        <audio
                          controls
                          preload="metadata"
                          src={msg.audioLocalUrl || msg.arquivo_url}
                          className="h-10 w-full max-w-[320px]"
                        >
                          Seu navegador não suporta reprodução de áudio.
                        </audio>
                        {msg.enviando && (
                          <p className="text-xs opacity-80">Enviando áudio...</p>
                        )}
                        {msg.erro && (
                          <button
                            type="button"
                            onClick={() => tentarReenviarAudio(msg)}
                            className="flex items-center gap-1 text-xs font-semibold underline"
                          >
                            <RotateCw size={13} />
                            Falha no envio — tentar novamente
                          </button>
                        )}
                      </div>
                    ) : anexo ? (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => !msg.enviando && !msg.erro && abrirAnexoEmDestaque(anexo)}
                        onKeyDown={(event) => {
                          if (
                            !msg.enviando &&
                            !msg.erro &&
                            (event.key === "Enter" || event.key === " ")
                          ) {
                            abrirAnexoEmDestaque(anexo);
                          }
                        }}
                        className="w-full space-y-3 rounded-2xl text-left transition hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-80">
                          <span className="rounded-full bg-white/15 px-2 py-1">
                            {obterLabelAnexo(anexo.mimeType)}
                          </span>
                          <span className="truncate">{anexo.nome}</span>
                        </div>

                        {anexo.tipo === "imagem" && (
                          <img src={anexo.url} alt={anexo.nome} className="w-full max-h-64 md:max-h-80 rounded-xl object-cover ring-1 ring-white/10" />
                        )}

                        {anexo.tipo === "video" && (
                          <div className="relative overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
                            <video className="max-h-64 md:max-h-80 w-full" src={anexo.url} />
                            <div className="absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/45 to-transparent p-4">
                              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                                Toque para abrir o vídeo
                              </span>
                            </div>
                          </div>
                        )}

                        {anexo.tipo === "pdf" && (
                          <div className="flex min-h-32 md:min-h-40 flex-col justify-between rounded-xl border border-white/15 bg-white/95 p-4 text-slate-900 ring-1 ring-white/10">
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
                        {msg.enviando && (
                          <p className="text-xs font-medium opacity-80">Enviando anexo...</p>
                        )}
                        {msg.erro && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              tentarReenviarAnexo(msg);
                            }}
                            className="flex items-center gap-1 text-xs font-semibold underline"
                          >
                            <RotateCw size={13} />
                            Falha no envio — tentar novamente
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="break-words text-sm md:text-base">
                        {textoMensagem}
                      </p>
                    )}
                    {!mensagemAudio && !anexo && msg.enviando && (
                      <p className="mt-1 text-[11px] text-blue-100">
                        Enviando...
                      </p>
                    )}

                    {!mensagemAudio && !anexo && msg.erro && (
                      <button
                        type="button"
                        onClick={() => tentarEnviarNovamente(msg)}
                        className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-200 underline"
                      >
                        <RotateCw size={12} />
                        Falha ao enviar — tentar novamente
                      </button>
                    )}

                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${
                        enviadaPorMim
                          ? "text-blue-100"
                          : "text-gray-400"
                      }`}
                    >
                      <span>
                        {new Date(msg.criadoEm).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {enviadaPorMim && !msg.enviando && !msg.erro && (
                        <span>
                          {msg.lida ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
          })}
          {novasMensagensPendentes > 0 && (
            <div className="sticky bottom-2 md:bottom-4 flex justify-center">
              <button
                onClick={irParaUltimaMensagem}
                className="rounded-full bg-blue-600 px-3 py-2 text-xs md:text-sm md:px-4 text-white shadow-lg hover:bg-blue-700 cursor-pointer"
              >
                ↓ {novasMensagensPendentes} nova{novasMensagensPendentes > 1 ? "s" : ""} mensagem{novasMensagensPendentes > 1 ? "s" : ""}
              </button>
            </div>
          )}
            <div ref={fimMensagensRef}/>
          </div>

          {/* Input */}
          <div className="border-t border-[#CDCDCD] bg-white px-3 py-3 md:px-6 md:py-4">

            {suporteAtivo ? (
              <p className="mb-2 text-xs text-slate-500">Sua mensagem será enviada como ticket para o administrador.</p>
            ) : (
              <p className="text-xs text-slate-500 mb-2">
                Imagens, vídeos e PDFs são armazenados com acesso protegido. Limite de 10 MB.
              </p>
            )}

            {suporteAtivo ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0 flex items-center bg-cyan-50 rounded-full">
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

            <>
            {estadoAudio !== "idle" && (
              <div className="mb-3 rounded-2xl border border-blue-100 bg-blue-50 p-3">
                <div className="flex flex-wrap items-center gap-3">
                  {estadoAudio === "requesting" && (
                    <p className="text-sm font-medium text-blue-700">Solicitando acesso ao microfone...</p>
                  )}
                  {estadoAudio === "recording" && (
                    <>
                      <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                      <p className="text-sm font-semibold text-slate-700">
                        Gravando {Math.floor(audioSegundos / 60)}:{String(audioSegundos % 60).padStart(2, "0")}
                      </p>
                      <button
                        type="button"
                        onClick={finalizarGravacaoAudio}
                        className="flex items-center gap-1 rounded-full bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                      >
                        <Square size={13} fill="currentColor" />
                        Finalizar
                      </button>
                    </>
                  )}
                  {(estadoAudio === "preview" || estadoAudio === "error") && audioPreviewUrl && (
                    <>
                      <audio controls src={audioPreviewUrl} className="h-10 min-w-0 flex-1" />
                      <button
                        type="button"
                        onClick={() => enviarAudio()}
                        className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
                      >
                        {estadoAudio === "error" ? "Tentar novamente" : "Enviar áudio"}
                      </button>
                    </>
                  )}
                  {estadoAudio === "sending" && (
                    <p className="text-sm font-medium text-blue-700">Enviando áudio...</p>
                  )}
                  {estadoAudio !== "requesting" && estadoAudio !== "sending" && (
                    <button
                      type="button"
                      onClick={cancelarGravacaoAudio}
                      className="ml-auto flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white"
                    >
                      <Trash2 size={14} />
                      Cancelar
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-500">Máximo de 2 minutos e 8 MB.</p>
              </div>
            )}
            <div className="flex items-center gap-3">

              <div className="relative">
                <button
                  onClick={() => {
                    setMostrarPainelEmoji((anterior) => !anterior);
                    setMostrarMenuAcoes(false);
                  }}
                  className="p-2 md:p-2 hover:bg-cyan-200 rounded-full cursor-pointer"
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


              <div className="flex-1 min-w-0 flex items-center bg-cyan-50 rounded-full">
                <input
                ref={inputMensagemRef}
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                placeholder="Digite uma mensagem..."
                className="w-full flex-1 rounded-full bg-transparent px-3 md:px-5 py-3 outline-none text-sm"
                onKeyDown={(e) => {
                if (e.key === "Enter") {
                  enviarMensagem();
                }
                }}
                />

                <button onClick={enviarMensagem}
                className="p-2 md:p-3 hover:bg-cyan-300 bg-cyan-100 rounded-full cursor-pointer"
                >
                  <StepForward size={20} fill="#3D64FD" color="#3D64FD"/>
                </button>

              </div>

              <input
                ref={inputAnexoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,application/pdf"
                className="hidden"
                onChange={(event) => {
                  const arquivo = event.target.files?.[0];
                  if (arquivo) enviarAnexo(arquivo);
                }}
              />
              <button
                type="button"
                onClick={() => inputAnexoRef.current?.click()}
                disabled={!chatSelecionado}
                aria-label="Enviar imagem, vídeo ou PDF"
                title="Enviar anexo"
                className="p-2 md:p-2 rounded-full cursor-pointer hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={20} color="#3D64FD"/>
              </button>

              <button
                type="button"
                onClick={iniciarGravacaoAudio}
                disabled={estadoAudio !== "idle" || !chatSelecionado}
                aria-label="Gravar mensagem de áudio"
                title="Gravar mensagem de áudio"
                className="p-2 hover:bg-cyan-200 cursor-pointer rounded-full disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Mic size={20} color="#3D64FD"/>
              </button>

              <button
                onClick={enviarLike}
                className="hidden md:block p-2 hover:bg-cyan-200 cursor-pointer rounded-full"
              >
                <ThumbsUp size={20} color="#3D64FD"/>
              </button>

            </div>
            </>
            )}
          </div>

        </section>
      </div>
      {modalSolicitacaoAberto && podeSolicitarServico && (
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
              disabled={carregandoCategoriasPrestador || categoriasPrestador.length === 0}
              className="w-full border border-[#CDCDCD] rounded-lg p-3"
              >
                <option value="">
                  {carregandoCategoriasPrestador
                    ? "Carregando categorias..."
                    : categoriasPrestador.length === 0
                    ? "Nenhuma categoria cadastrada para este prestador"
                    : "Selecione a categoria"}
                </option>
                {categoriasPrestador.map((nomeCategoria) => (
                  <option key={nomeCategoria} value={nomeCategoria}>
                    {nomeCategoria}
                  </option>
                ))}
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
                      className="flex items-center gap-2 md:gap-3 rounded-lg border border-slate-200 bg-white p-2"
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
