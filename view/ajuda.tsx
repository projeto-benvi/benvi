"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "@/components/searchBar"; 
import { 
  Headset, 
  FileText, 
  Mail, 
  Phone, 
  Upload,
  Loader,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface TicketSuporte {
  id_ticket: number;
  titulo: string;
  descricao: string;
  status: string;
  data_abertura: string;
  data_encerramento?: string;
}

export default function Ajuda() {
  const { user, logado } = useAuth();
  const router = useRouter();
  
  // Estados do formulário
  const [tipoProblema, setTipoProblema] = useState("");
  const [dataOcorrido, setDataOcorrido] = useState("");
  const [assunto, setAssunto] = useState("");
  const [descricao, setDescricao] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  
  // Estados de controle
  const [enviando, setEnviando] = useState(false);
  const [carregandoTickets, setCarregandoTickets] = useState(true);
  const [tickets, setTickets] = useState<TicketSuporte[]>([]);
  const [filtroHistorico, setFiltroHistorico] = useState<"recentes" | "todos">("recentes");
  const [modalEmailAberto, setModalEmailAberto] = useState(false);
  const [modalLigacaoAberto, setModalLigacaoAberto] = useState(false);
  const [modalFaqAberto, setModalFaqAberto] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  // Listar tickets ao carregar a página
  useEffect(() => {
    if (logado && user?.id) {
      carregarTickets();
      return;
    }

    setTickets([]);
    setCarregandoTickets(false);
  }, [logado, user?.id]);

  const carregarTickets = async () => {
    try {
      setCarregandoTickets(true);
      const response = await fetch(`/api/ticketSuporte?id_usuario=${user?.id}`);
      if (response.ok) {
        const dados = await response.json();
        setTickets(dados);
      }
    } catch (erro) {
      console.error("Erro ao carregar tickets:", erro);
      setMensagem({ tipo: "erro", texto: "Erro ao carregar seus chamados" });
    } finally {
      setCarregandoTickets(false);
    }
  };

  const converterArquivoParaBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resultado = typeof reader.result === "string" ? reader.result : "";
        const base64 = resultado.includes(",") ? resultado.split(",")[1] : resultado;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
      reader.readAsDataURL(file);
    });
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!logado || !user?.id) {
      setMensagem({ tipo: "erro", texto: "Você precisa estar logado para enviar um ticket" });
      return;
    }

    if (!tipoProblema || !assunto || !descricao) {
      setMensagem({ tipo: "erro", texto: "Por favor, preencha todos os campos obrigatórios" });
      return;
    }

    const idUsuario = Number(user.id);
    if (Number.isNaN(idUsuario)) {
      setMensagem({ tipo: "erro", texto: "Não foi possível identificar sua conta para abrir o ticket" });
      return;
    }

    try {
      setEnviando(true);
      
      let descricaoCompleta = `Tipo: ${tipoProblema}\nData do ocorrido: ${dataOcorrido || "Não especificada"}\n\n${descricao}`;

      if (arquivo) {
        const conteudoBase64 = await converterArquivoParaBase64(arquivo);
        descricaoCompleta +=
          `\n\n--- ANEXO ---\n` +
          `nome: ${arquivo.name}\n` +
          `tipo: ${arquivo.type || "nao informado"}\n` +
          `tamanho_bytes: ${arquivo.size}\n` +
          `conteudo_base64: ${conteudoBase64}`;
      }

      const payloadTicket = {
        id_usuario: idUsuario,
        titulo: assunto,
        descricao: descricaoCompleta,
      };

      const response = await fetch("/api/ticketSuporte", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadTicket),
      });

      if (response.ok) {
        setMensagem({ tipo: "sucesso", texto: "Ticket criado com sucesso e enviado para verificação no painel do admin." });
        
        // Limpar formulário
        setTipoProblema("");
        setDataOcorrido("");
        setAssunto("");
        setDescricao("");
        setArquivo(null);
        
        // Recarregar tickets
        await carregarTickets();
      } else {
        const erro = await response.json();
        setMensagem({ tipo: "erro", texto: erro.erro || "Erro ao criar ticket" });
      }
    } catch (erro) {
      console.error("Erro ao enviar ticket:", erro);
      setMensagem({ tipo: "erro", texto: "Erro ao enviar o ticket. Tente novamente." });
    } finally {
      setEnviando(false);
    }
  };

  const handleArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const tamanhoMB = file.size / (1024 * 1024);
      
      if (tamanhoMB > 10) {
        setMensagem({ tipo: "erro", texto: "Arquivo muito grande. Máximo 10 MB." });
        return;
      }
      
      setArquivo(file);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "aberto":
        return "bg-blue-100 text-blue-600";
      case "em andamento":
        return "bg-yellow-100 text-yellow-700";
      case "pendente":
        return "bg-orange-100 text-orange-600";
      case "análise":
        return "bg-yellow-100 text-yellow-600";
      case "fechado":
        return "bg-green-100 text-green-600";
      case "concluído":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const irParaMensagens = () => {
    router.push("/mensagens");
  };

  const abrirEmail = () => {
    setModalEmailAberto(true);
  };

  const abrirLigacao = () => {
    setModalLigacaoAberto(true);
  };

  const abrirFaq = () => {
    setModalFaqAberto(true);
  };

  const abrirEmailMicrosoft = () => {
    window.open("https://outlook.office.com/mail/deeplink/compose?to=suporte@benvi.com", "_blank", "noopener,noreferrer");
    setModalEmailAberto(false);
  };

  const abrirEmailGoogle = () => {
    window.open("https://mail.google.com/mail/?view=cm&fs=1&to=suporte@benvi.com", "_blank", "noopener,noreferrer");
    setModalEmailAberto(false);
  };

  const ligarFixo = () => {
    window.location.href = "tel:08000000000";
    setModalLigacaoAberto(false);
  };

  const abrirWhatsapp = () => {
    window.open("https://wa.me/5508000000000", "_blank", "noopener,noreferrer");
    setModalLigacaoAberto(false);
  };

  const faqs = [
    {
      pergunta: "Quanto tempo leva para responder um chamado?",
      resposta: "A equipe de suporte analisa os tickets por ordem de chegada. Em geral, o retorno inicial ocorre em ate 24 horas uteis.",
    },
    {
      pergunta: "Como acompanho o status do meu ticket?",
      resposta: "Use o Historico de chamados nesta pagina para ver protocolo, data e status atualizado do seu atendimento.",
    },
    {
      pergunta: "Posso anexar comprovantes ou imagens?",
      resposta: "Sim. O formulario aceita anexos JPG, PNG e PDF com tamanho maximo de 10 MB por envio.",
    },
    {
      pergunta: "O que fazer se o app apresentar erro recorrente?",
      resposta: "Abra um ticket com detalhes do erro, horario aproximado e, se possivel, um anexo com print para agilizar a analise.",
    },
    {
      pergunta: "Como falar com suporte mais rapido?",
      resposta: "Voce pode entrar na area de mensagens para atendimento direto ou usar os contatos de e-mail e telefone na parte superior.",
    },
  ];

  const ticketsOrdenados = [...tickets].sort(
    (a, b) => new Date(b.data_abertura).getTime() - new Date(a.data_abertura).getTime()
  );
  const ticketsExibidos = filtroHistorico === "recentes" ? ticketsOrdenados.slice(0, 3) : ticketsOrdenados;

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8F9FA]">
      {/* SearchBar renderizada no topo */}
      <SearchBar />

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Ajuda</h1>
          <p className="text-gray-500 font-medium mt-1">
            Encontre suporte, tire dúvidas ou reporte um problema na plataforma
          </p>
        </div>

        {/* Mensagem de Feedback */}
        {mensagem && (
          <div className={`mb-6 p-4 rounded-lg ${mensagem.tipo === "sucesso" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {mensagem.texto}
          </div>
        )}

        {/* Cards de Acesso Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <Headset className="text-blue-600 w-6 h-6" />
            </div>
            <div className="flex flex-col items-start">
              <h3 className="font-bold text-gray-800 text-lg">Pedir Ajuda</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Fale com o suporte da Benvi para tirar dúvidas sobre sua conta, serviços ou pagamentos.
              </p>
              <button
                type="button"
                onClick={irParaMensagens}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                ENTRAR EM CONTATO
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <Mail className="text-blue-600 w-6 h-6" />
            </div>
            <div className="flex flex-col items-start w-full">
              <h3 className="font-bold text-gray-800 text-lg">Contatos</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Fale com nosso suporte por e-mail ou telefone para tirar duvidas e acompanhar seu atendimento.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={abrirEmail}
                  className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold rounded-lg transition-colors"
                >
                  Enviar e-mail
                </button>
                <button
                  type="button"
                  onClick={abrirLigacao}
                  className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Ligar agora
                </button>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <FileText className="text-blue-600 w-6 h-6" />
            </div>
            <div className="flex flex-col items-start w-full">
              <h3 className="font-bold text-gray-800 text-lg">Dúvidas frequentes</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Veja respostas rápidas para as dúvidas mais comuns dos prestadores.
              </p>
              <button
                type="button"
                onClick={abrirFaq}
                className="mt-4 px-6 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold rounded-lg transition-colors"
              >
                Ver FAQ
              </button>
            </div>
          </div>
        </div>

        {/* Seção Inferior: Formulário + Histórico */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Lado Esquerdo: Formulário */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-blue-100 shadow-md p-7 h-full">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Reportar problema</h2>
              <p className="text-gray-500 text-sm mt-1">Preencha os dados abaixo para enviar seu relato</p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleEnviar}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Tipo de problema */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Tipo de problema *</label>
                  <select 
                    required 
                    value={tipoProblema}
                    onChange={(e) => setTipoProblema(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg h-11 px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                    <option value="" disabled>Selecione o tipo de problema</option>
                    <option value="pagamento">Problema com pagamento</option>
                    <option value="app">Erro no aplicativo</option>
                    <option value="cliente">Problema com cliente</option>
                    <option value="outro">Outro</option>
                    </select>
                </div>

                {/* Data do ocorrido */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Data do ocorrido:</label>
                  <input 
                    type="date" 
                    value={dataOcorrido}
                    onChange={(e) => setDataOcorrido(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg h-11 px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Assunto */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Assunto: *</label>
                <input 
                  type="text" 
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Descreva brevemente o assunto"
                  required
                  className="w-full border border-gray-300 rounded-lg h-11 px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Descrição */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Descreva o problema: *</label>
                <textarea 
                  rows={5}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Detalhe o problema com o máximo de informações possível"
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Upload de Arquivo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Anexar imagem ou arquivo</label>
                <label className="w-full max-w-sm border-2 border-dashed border-blue-300 rounded-lg p-4 flex items-center gap-4 hover:bg-blue-50/50 transition-colors cursor-pointer">
                  <input 
                    type="file" 
                    onChange={handleArquivo}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                  />
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                    <Upload className="text-blue-500 w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600 font-medium">
                      {arquivo ? arquivo.name : "Clique para anexar ou arraste o arquivo até aqui"}
                    </span>
                    <span className="text-xs text-gray-400">JPG, PNG OU PDF até 10 mb</span>
                  </div>
                </label>
              </div>

              {/* Botão Enviar */}
              <div className="mt-2">
                <button 
                  type="submit"
                  disabled={enviando}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 px-10 rounded-lg transition-colors flex items-center gap-2"
                >
                  {enviando ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Lado Direito: Histórico de Chamados */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 h-full flex flex-col">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-gray-800">Historico de chamados</h2>
              <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setFiltroHistorico("recentes")}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                    filtroHistorico === "recentes"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Recentes
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroHistorico("todos")}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                    filtroHistorico === "todos"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Ver todos
                </button>
              </div>
            </div>
              
            {carregandoTickets ? (
              <div className="flex items-center justify-center py-8 flex-1">
                <Loader className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : ticketsExibidos.length === 0 ? (
              <div className="text-center py-8 flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-500">Voce ainda nao tem historico de chamados</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-2 text-[11px] font-semibold text-gray-500">Protocolo</th>
                      <th className="pb-2 text-[11px] font-semibold text-gray-500">Assunto</th>
                      <th className="pb-2 text-[11px] font-semibold text-gray-500">Data</th>
                      <th className="pb-2 text-[11px] font-semibold text-gray-500 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-800">
                    {ticketsExibidos.map((ticket) => (
                      <tr key={ticket.id_ticket} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 font-medium">#{ticket.id_ticket}</td>
                        <td className="py-2 truncate max-w-[140px]">{ticket.titulo}</td>
                        <td className="py-2">{formatarData(ticket.data_abertura)}</td>
                        <td className="py-2 text-right">
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {modalEmailAberto && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Escolha seu e-mail</h3>
                <button
                  type="button"
                  onClick={() => setModalEmailAberto(false)}
                  className="p-1 rounded-md hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Como voce quer enviar sua mensagem para suporte@benvi.com?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={abrirEmailMicrosoft}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Microsoft
                </button>
                <button
                  type="button"
                  onClick={abrirEmailGoogle}
                  className="px-4 py-3 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Google
                </button>
              </div>
            </div>
          </div>
        )}

        {modalLigacaoAberto && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Escolha o canal de contato</h3>
                <button
                  type="button"
                  onClick={() => setModalLigacaoAberto(false)}
                  className="p-1 rounded-md hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Voce quer continuar por telefone fixo ou WhatsApp?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={ligarFixo}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Fixo
                </button>
                <button
                  type="button"
                  onClick={abrirWhatsapp}
                  className="px-4 py-3 border border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {modalFaqAberto && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Perguntas frequentes</h3>
                <button
                  type="button"
                  onClick={() => setModalFaqAberto(false)}
                  className="p-1 rounded-md hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="space-y-3">
                {faqs.map((item) => (
                  <div key={item.pergunta} className="border border-gray-200 rounded-xl p-4 bg-gray-50/60">
                    <p className="text-sm font-semibold text-gray-800 mb-1">{item.pergunta}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.resposta}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
