"use client";
import logo from "@/assets/benvi colorido 2.svg"
import { Search, Plus, Mic, ThumbsUp, SmilePlus, AlertTriangle, EllipsisVertical, Star, StepForward } from "lucide-react";
import SearchBar from "@/components/searchBar";
import { useInsertionEffect, useRef, useState, useEffect } from "react";


export default function Conversa() {
    
  const [busca, setBusca] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [novaMensagem, setNovaMensagem] = useState("");

  type Mensagem = {
    id: number;
    texto: string;
    enviada: boolean;
    horario: string;
  };

  type Chat = {
    id: number;
    nome: string;
    horario: string;
    mensagens: Mensagem[];
  };

  const [listaChats, setListaChats] = useState<Chat[]>([
    {
      id: 1,
      nome: "Josivaldo da Silva",
      mensagens: [
      {
        id: 1,
        texto: "Olá",
        enviada: false,
        horario: "15:30",
      },
      {
        id: 2,
        texto: "Tudo bem",
        enviada: true,
        horario: "15:31",
      },
      ],
      horario: "15:30",
    },
    {
      id: 2,
      nome: "Maria Oliveira",
      mensagens: [
      {
        id: 1,
        texto: "Bom dia",
        enviada: false,
        horario: "10:00",
      },
      ],
      horario: "14:20",
    },
    {
      id: 3,
      nome: "Ronaldo Oliveira",
      mensagens: [
      {
        id: 1,
        texto: "Preciso de ajuda",
        enviada: false,
        horario: "12:34",
      },
      ],
      horario: "12:34",
    },{
      id: 4,
      nome: "Ronaldoa Oliveira",
      mensagens: [
      {
        id: 1,
        texto: "Preciso de ajuda",
        enviada: false,
        horario: "12:34",
      },
      ],
      horario: "12:34",
    },{
      id: 5,
      nome: "Ronaldoaa Oliveira",
      mensagens: [
      {
        id: 1,
        texto: "Preciso de ajuda",
        enviada: false,
        horario: "12:34",
      },
      ],
      horario: "12:44",
    },{
      id: 6,
      nome: "Ronaldo Oliveira",
      mensagens: [
      {
        id: 1,
        texto: "Preciso de ajuda",
        enviada: false,
        horario: "12:34",
      },
      ],
      horario: "12:34",
    },{
      id: 7,
      nome: "Ronaldo Oliveira",
      mensagens: [
      {
        id: 1,
        texto: "Preciso de ajuda",
        enviada: false,
        horario: "12:34",
      },
      ],
      horario: "12:34",
    },{
      id: 8,
      nome: "Ronaldo Oliveira",
      mensagens: [
      {
        id: 1,
        texto: "Preciso de ajuda",
        enviada: false,
        horario: "12:34",
      },
      ],
      horario: "12:34",
    },{
      id: 9,
      nome: "Ronaldo Oliveira",
      mensagens: [
      {
        id: 1,
        texto: "Preciso de ajuda",
        enviada: false,
        horario: "12:34",
      },
      ],
      horario: "12:34",
    },
  ]);

  const [chatSelecionado, setChatSelecionado] = useState<Chat>(listaChats[0]);
  
  const enviarMensagem = () => {
    if (!novaMensagem.trim()) return;

    const chatsFiltrados = listaChats.filter((chat) =>
      chat.nome
        .toLowerCase()
        .includes(busca.toLowerCase())
    );
    
    const novaMsg: Mensagem = {
      id: Date.now(),
      texto: novaMensagem,
      enviada: true,
      horario: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const chatsAtualizados = chatsFiltrados.map((chat) => {
      if (chat.id === chatSelecionado.id) {
        return {
          ...chat,
          mensagens: [...chat.mensagens, novaMsg],
        };
      }

      return chat;
    });

    setListaChats(chatsAtualizados);

    const chatAtualizado = chatsAtualizados.find(
      (c) => c.id === chatSelecionado.id
    );

    if (chatAtualizado) {
      setChatSelecionado(chatAtualizado);
    }

    setNovaMensagem("");
  };

  const fimMensagensRef = useRef<HTMLDivElement>(null);

  useEffect(()=> {
    fimMensagensRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chatSelecionado.mensagens]);
  













  return (
    <div className="h-screen flex flex-col bg-white">

      {/* SearchBar */}
      <div className="border-b border-[#CDCDCD] shrink-0">
        <SearchBar />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 overflow-hidden">

        {/* Lista de Conversas */}
        <aside className="w-[340px] border-r border-[#CDCDCD] bg-white flex flex-col">

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
            {listaChats.map((chat) => (
              <div
              key={chat.id}
              onClick={() => setChatSelecionado(chat)}
              className={`
                flex gap-3 px-4 py-4 border-b border-[#CDCDCD]
                cursor-pointer
                hover:bg-[#F7F7F7]
                ${chatSelecionado.id === chat.id ? "bg-blue-50" : ""}
              `}>
                <div className="h-12 w-12 rounded-full bg-gray-300 shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-sm">
                      {chat.nome}
                    </h3>

                    <span className="text-xs text-gray-400">
                      {chat.horario}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 truncate">
                    {chat.mensagens[chat.mensagens.length - 1]?.texto}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Contato fixo */}
          <div className="border-t border-[#CDCDCD] bg-white shrink-0">
            <div className="flex gap-3 px-4 py-4 cursor-pointer hover:bg-[#F7F7F7]">
              <div className="h-12 w-12 rounded-full bg-blue-500 shrink-0"/>
                
                
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
        <section className="flex-1 flex flex-col bg-white">

          {/* Header da conversa */}
          <div className="h-20 border-b border-[#CDCDCD] px-6 flex items-center justify-between">

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-300" />

              <div>
                <h2 className="font-semibold text-[15px]">
                  {chatSelecionado.nome}
                </h2>

                <p className="text-sm text-gray-500">
                  Prestador
                </p>
              </div>

              <button className="ml-4 bg-[#2F80ED] text-white px-5 py-2 rounded-full text-sm hover:bg-blue-600 cursor-pointer">
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

            {chatSelecionado.mensagens.map((msg) => (
              <div
                key={msg.id}
                className={`mb-5 flex ${
                  msg.enviada
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[60%] rounded-3xl px-5 py-3 rounded-2xl  ${
                    msg.enviada
                      ? "bg-[#2F80ED] text-white rounded-br-none"
                      : "bg-[#DCE6FF] text-[#333] rounded-bl-none"
                  }`}
                >
                  <p>{msg.texto}</p>

                  <p
                    className={`text-[11px] mt-1 ${
                      msg.enviada
                        ? "text-blue-100"
                        : "text-gray-400"
                    }`}
                  >
                    {msg.horario}
                  </p>
                </div>
              </div>
            ))}
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

              <button className="p-2 hover:bg-cyan-200 cursor-pointer rounded-full">
                <Mic size={20} color="#3D64FD"/>
              </button>

              <button className="p-2 hover:bg-cyan-200 cursor-pointer rounded-full">
                <ThumbsUp size={20} color="#3D64FD"/>
              </button>

            </div>
          </div>

        </section>
      </div>
    </div>
  );
}