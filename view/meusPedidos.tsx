"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth"; 
import SearchBar from "@/components/searchBar"; 
import { useRouter } from "next/navigation"; // Importado para fazer o redirecionamento interno

import { 
  FaStar, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaCheckCircle,
  FaRegCommentDots // Ícone de balão de fala para o botão Contatar
} from "react-icons/fa";

interface PedidoExtendido {
  id_solicitacao: number;
  id_usuario: number;
  id_prestador: number;
  prestador_nome: string;
  prestador_foto: string;
  endereco: string;
  data_solicitacao: string;
  data_agendamento: string;
  status: boolean; // false = Pendente, true = Concluído
  descricao_servico: string;
  complemento: string;
}

export default function MeusPedidosView() {
  const { user } = useAuth(); 
  const router = useRouter(); // Inicializando o roteador do Next.js
  const [pedidos, setPedidos] = useState<PedidoExtendido[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<string>("Todos");
  const [carregando, setCarregando] = useState<boolean>(true);

  useEffect(() => {
    async function buscarPedidos() {
      const idUsuarioDestino = (user as any)?.id_usuario || user?.id;

      if (!idUsuarioDestino) return;

      try {
        const response = await fetch(`/api/meus-pedidos?idUsuario=${idUsuarioDestino}`);
        if (response.ok) {
          const dados = await response.json();
          setPedidos(dados);
        }
      } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
      } finally {
        setCarregando(false);
      }
    }

    if (user) {
      buscarPedidos();
    }
  }, [user]);

  const pedidosFiltrados = pedidos.filter((pedido) => {
  if (filtroAtivo === "Todos") return true;

  const statusBooleano = Boolean(pedido.status);

  if (filtroAtivo === "Concluídos") return statusBooleano === true;
  if (filtroAtivo === "Pendente") return statusBooleano === false;
  
  return true;
});

  const formatarData = (dataString: string) => {
    if (!dataString) return "";
    const d = new Date(dataString);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) + "h";
  };

  return (
    <section className="flex w-full h-screen bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        <SearchBar />

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1200px] w-full mx-auto">
            
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Meus pedidos</h1>
              <p className="text-gray-400 text-sm">Acompanhe todos os serviços que você contratou</p>
            </div>

            {/* Pílulas de Filtro */}
            <div className="flex gap-3 mb-8">
              {["Todos", "Concluídos", "Pendente"].map((filtro) => {
                const ativo = filtroAtivo === filtro;
                return (
                  <button
                    key={filtro}
                    type="button"
                    onClick={() => setFiltroAtivo(filtro)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      ativo
                        ? "bg-[#D9E4FF] text-blue-600 border-transparent"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {filtro}
                  </button>
                );
              })}
            </div>

            {carregando ? (
              <div className="text-center py-12 text-gray-400 font-medium">Carregando seus pedidos...</div>
            ) : (
              <div className="flex flex-col gap-0 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {pedidosFiltrados.map((pedido, index) => (
                  <div 
                    key={pedido.id_solicitacao} 
                    className={`p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-gray-50/50 ${
                      index !== pedidosFiltrados.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      <img 
                        src={pedido.prestador_foto || "https://via.placeholder.com/150"} 
                        alt={pedido.prestador_nome} 
                        className="w-14 h-14 rounded-full object-cover border border-gray-100 shrink-0"
                      />
                      <div className="flex flex-col gap-1.5">
                        <h3 className="text-sm font-bold text-[#1E293B]">{pedido.descricao_servico}</h3>
                        
                        <p className="text-xs text-gray-400 font-medium">
                          com <span className="text-blue-500 hover:underline cursor-pointer font-semibold">{pedido.prestador_nome}</span>
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 font-medium mt-1">
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt className="text-gray-400" /> {pedido.data_agendamento ? formatarData(pedido.data_agendamento) : "A definir"}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaMapMarkerAlt className="text-gray-400" /> {pedido.endereco} {pedido.complemento && `(${pedido.complemento})`}
                          </span>
                        </div>

                        <p className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${
                          pedido.status ? "text-green-500" : "text-amber-500"
                        }`}>
                          {pedido.status ? <FaCheckCircle size={10} /> : <FaClock size={10} />}
                          {pedido.status ? "Serviço concluído com sucesso" : "Serviço aguardando atendimento"}
                        </p>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex justify-between md:justify-end items-center gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 self-stretch md:self-auto">
                      <div className="hidden md:block h-16 w-[1px] bg-gray-100"></div>

                      <div className="flex flex-col items-end gap-2 ml-auto md:ml-0 w-full md:w-auto">
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-md ${
                            Boolean(pedido.status) 
                            ? "bg-green-50 text-green-600" 
                            : "bg-amber-50 text-amber-600"
                                }`}>
                                 {Boolean(pedido.status) ? "Concluído" : "Pendente"}
                                </span>

                        {pedido.status ? (
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} size={12} className="text-amber-400" />
                            ))}
                          </div>
                        ) : (
                          /* Botão Azul de Mensageria Interna baseado no protótipo */
                          <button 
                            type="button" 
                            onClick={() => {
                              // Redireciona para a aba de Mensagens enviando o ID do prestador na URL
                              router.push(`/mensagens?id_prestador=${pedido.id_prestador}`);
                            }}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                          >
                            <FaRegCommentDots size={14} />
                            Contatar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {pedidosFiltrados.length === 0 && (
                  <div className="p-12 text-center text-gray-400 font-medium text-sm">
                    Nenhum serviço encontrado nesta categoria.
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>

        <footer className="text-center text-[11px] text-gray-400 py-4 border-t border-gray-100 bg-white shrink-0 flex justify-center gap-4">
          <p className="hover:underline cursor-pointer">Política de Privacidade - Termos</p>
          <p>© 2026 Benvi</p>
        </footer>

      </main>
    </section>
  );
}