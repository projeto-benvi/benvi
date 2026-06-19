"use client";
import logo from "@/assets/benvi colorido 2.svg"
import { Search, Plus, Mic, ThumbsUp, SmilePlus, AlertTriangle, X, EllipsisVertical, Star, StepForward } from "lucide-react";
import SearchBar from "@/components/searchBar";
import { useRef, useState, useEffect } from "react";


export default function Conversa() {

   const [fotos, setFotos] = useState<File[]>([]);
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataServico, setDataServico] = useState("");
  const [endereco, setEndereco] = useState("");
  const [modalSolicitacaoAberto, setModalSolicitacaoAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [novaMensagem, setNovaMensagem] = useState("");
  const [erro, setErro] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const fimMensagensRef = useRef<HTMLDivElement>(null);

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

  type Chat = {
  idConversa: number;
  idUsuario: number;
  idPrestador: number;

  nome: string;
  fotoPerfil?: string;

  ultimaMensagemEm: string;

  mensagens?: Mensagem[];
};
  // ==========================
  // STATES
  // ==========================

  const [listaChats, setListaChats] = useState<Chat[]>([]);
  const [chatSelecionado, setChatSelecionado] = useState<Chat | null>(null);

  // ==========================
  // FILTRO
  // ==========================

  const chatsFiltrados = listaChats.filter((chat) =>
    chat.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // ==========================
  // SCROLL
  // ==========================

  useEffect(() => {
    fimMensagensRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chatSelecionado?.mensagens]);

  // ==========================
  // CONVERSAS
  // ==========================

  const carregarConversas = async () => {
    try {
      const response = await fetch(
        "/api/conversas?idParticipante=1&tipoParticipante=prestador"
      );

      const dados = await response.json();

      setListaChats(dados);

      if (dados.length > 0 && !chatSelecionado) {
        setChatSelecionado(dados[0]);
        carregarMensagens(dados[0].idConversa);
      }

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    carregarConversas();
  }, []);

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
          idRemetente: 1, // substituir pelo usuário logado
          conteudo: novaMensagem,
        }),
      });

      await carregarMensagens(chatSelecionado.idConversa);

      setNovaMensagem("");

    } catch (error) {
      console.error(error);
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

  // ==========================
  // SOLICITAÇÃO
  // ==========================

  const enviarSolicitacao = () => {

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

  }
  const enviarLike = async () => {
    if (!chatSelecionado) return;

    await fetch("/api/mensagens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idConversa: chatSelecionado.idConversa,
        idRemetente: 1,
        conteudo: "👍",
      }),
    });

    carregarMensagens(chatSelecionado.idConversa);
  };















  return (
    <div className="h-screen flex flex-col bg-white">

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
                      {chat.nome}
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
            <div className="flex gap-3 px-4 py-4 cursor-pointer hover:bg-[#F7F7F7]">
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
                  Atendimento da plataforma
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
                  {chatSelecionado?.nome ?? "Selecione uma conversa"}
                </h2>

                <p className="text-sm text-gray-500">
                  Prestador
                </p>
              </div>

              <button  onClick={() => setModalSolicitacaoAberto(true)}
              className="ml-4 bg-[#2F80ED] text-white px-5 py-2 rounded-full text-sm hover:bg-blue-600 cursor-pointer">
                Solicitar serviço
              </button>

            </div>
            
            {/* Lado direito */}
            <div className="flex items-center gap-4">
              
              <button className="p-2 rounded-full hover:bg-blue-200 cursor-pointer">
                  <Star size={20} color="blue"/>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
                  <Search  size={20} />
              </button>

              <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
                  <EllipsisVertical size={20} />
              </button>
              <button className="p-2 rounded-full hover:bg-red-200 cursor-pointer">
                  <AlertTriangle color="red" size={20} />
              </button>

            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto bg-[#FAFAFA] px-8 py-6">

            {chatSelecionado?.mensagens?.map((msg) => {

              const enviadaPorMim = msg.idRemetente === 1;

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
                    <p>{msg.conteudo}</p>

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

            <div className="flex items-center gap-3">

              <button className="p-2 hover:bg-cyan-200 cursor-pointer rounded-full">
                <SmilePlus size={20} color="#3D64FD" />
              </button>   


              <div className="flex-1 flex items-center bg-cyan-50 rounded-full">
                <input
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
              
              <button className="p-2 hover:bg-cyan-200 cursor-pointer rounded-full">
                <Plus size={20} color="#3D64FD"/>
              </button>

              <button onClick={() => alert("Áudio em desenvolvimento")}
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

              {/* PASSO 5 VAI AQUI */}
              {fotos.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {fotos.map((foto, index) => (
                    <div
                      key={index}
                      className="relative"
                    >
                      <img
                        src={URL.createObjectURL(foto)}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setFotos(fotos.filter((_, i) => i !== index))
                        }
                        className="
                          absolute
                          top-1
                          right-1
                          bg-white
                          rounded-full
                          p-1
                          shadow
                          cursor-pointer
                        "
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
    </div>
  );
}