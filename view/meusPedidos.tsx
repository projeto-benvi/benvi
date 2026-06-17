"use client";

import { useState } from "react";
import { 
  FaSlidersH, 
  FaStar, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaCheckCircle 
} from "react-icons/fa";

// Interface para estruturar os dados fictícios dos pedidos
interface Pedido {
  id_pedido: number;
  titulo_servico: string;
  prestador_nome: string;
  prestador_foto: string;
  data_servico: string;
  endereco: string;
  status: "Concluído" | "Pendente";
  tempo_passado: string;
  nota_avaliacao?: number;
  status_detalhe?: string;
}

export default function MeusPedidosView() {
  const [filtroAtivo, setFiltroAtivo] = useState<string>("Todos");

  // Dados estáticos simulando o que virá do banco de dados futuramente
  const pedidosMockados: Pedido[] = [
    {
      id_pedido: 1,
      titulo_servico: "Encanamento completo",
      prestador_nome: "Carlos Silva",
      prestador_foto: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150", // Foto fictícia de um profissional
      data_servico: "25/05/2026 às 09:30",
      endereco: "Av. Júlio Brasileiro, nº 362 - Garanhuns, PE",
      status: "Concluído",
      tempo_passado: "2 dias atrás",
      nota_avaliacao: 5,
      status_detalhe: "Serviço concluído na data de 25/05/2026 às 12:30"
    },
    {
      id_pedido: 2,
      titulo_servico: "Rede elétrica de cobre completa",
      prestador_nome: "El-nassir",
      prestador_foto: "https://tse1.mm.bing.net/th/id/OIP.UEROPO9OeWOlnLI1_66Z9AAAAA?w=472&h=630&rs=1&pid=ImgDetMain&o=7&rm=3 ", // Foto fictícia
      data_servico: "23/05/2026 às 09:30",
      endereco: "Av. Júlio Brasileiro, nº 362 - Garanhuns, PE",
      status: "Pendente",
      tempo_passado: "15 min atrás",
      status_detalhe: "Serviço em andamento"
    }
  ];

  // Filtragem local puramente no Front-end baseada no clique dos botões
  const pedidosFiltrados = pedidosMockados.filter((pedido) => {
    if (filtroAtivo === "Todos") return true;
    return pedido.status === filtroAtivo;
  });

  return (
    <section className="flex w-full h-screen bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header Superior (Idêntico ao da tela de categorias) */}
        <header className="w-full bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center shrink-0">
          <div className="w-full max-w-[480px] relative">
            <input 
              type="text" 
              placeholder="Buscar serviços..." 
              className="w-full bg-[#F1F5F9] text-gray-800 rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-gray-400"
            />
            <FaSlidersH className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">Olá, Pedro</p>
              <p className="text-xs text-gray-400">Cliente</p>
            </div>
            {/* Mantendo o avatar do layout original */}
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" 
              alt="Pedro" 
              className="w-10 h-10 rounded-full border border-gray-200 object-cover"
            />
          </div>
        </header>

        {/* Container Principal */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1200px] w-full mx-auto">
            
            {/* Títulos da página */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Serviços</h1>
              <p className="text-gray-400 text-sm">Acompanhe todos os serviços que você contratou</p>
            </div>

            {/* Pílulas de Filtro (Todos, Concluídos, Pendente) */}
            <div className="flex gap-3 mb-8">
              {["Todos", "Concluídos", "Pendente"].map((filtro) => {
                // Ajuste de string porque o estado salva "Concluídos" mas o objeto do banco usa "Concluído"
                const filtroNormalizado = filtro === "Concluídos" ? "Concluído" : filtro;
                const ativo = filtroAtivo === filtroNormalizado;

                return (
                  <button
                    key={filtro}
                    onClick={() => setFiltroAtivo(filtroNormalizado)}
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

            {/* Lista de Cards de Pedidos */}
            <div className="flex flex-col gap-0 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {pedidosFiltrados.map((pedido, index) => (
                <div 
                  key={pedido.id_pedido} 
                  className={`p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-gray-50/50 ${
                    index !== pedidosFiltrados.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  {/* Bloco Esquerdo: Dados do Serviço */}
                  <div className="flex gap-4 items-start">
                    <img 
                      src={pedido.prestador_foto} 
                      alt={pedido.prestador_nome} 
                      className="w-14 h-14 rounded-full object-cover border border-gray-100 shrink-0"
                    />
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-sm font-bold text-[#1E293B]">{pedido.titulo_servico}</h3>
                      
                      <p className="text-xs text-gray-400 font-medium">
                        com <span className="text-blue-500 hover:underline cursor-pointer font-semibold">{pedido.prestador_nome}</span>
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 font-medium mt-1">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-400" /> {pedido.data_servico}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-gray-400" /> {pedido.endereco}
                        </span>
                      </div>

                      {/* Texto descritivo pequeno de status embaixo */}
                      {pedido.status_detalhe && (
                        <p className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${
                          pedido.status === "Concluído" ? "text-green-500" : "text-amber-500"
                        }`}>
                          {pedido.status === "Concluído" ? <FaCheckCircle size={10} /> : <FaClock size={10} />}
                          {pedido.status_detalhe}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bloco Direito: Status, Avaliação e Tempo (Separador Vertical Simulado) */}
                  <div className="w-full md:w-auto flex justify-between md:justify-end items-center gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 self-stretch md:self-auto">
                    
                    {/* Linha vertical divisória apenas visível em telas grandes */}
                    <div className="hidden md:block h-16 w-[1px] bg-gray-100"></div>

                    <div className="flex flex-col items-end gap-2 ml-auto md:ml-0">
                      {/* Badge de Status */}
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-md ${
                        pedido.status === "Concluído" 
                          ? "bg-green-50 text-green-600" 
                          : "bg-amber-50 text-amber-600"
                      }`}>
                        {pedido.status}
                      </span>

                      {/* Estrelas de Avaliação ou Botão de Avaliar */}
                      {pedido.status === "Concluído" ? (
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <FaStar 
                                key={i} 
                                size={12} 
                                className={i < (pedido.nota_avaliacao || 0) ? "text-amber-400" : "text-gray-200"} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-blue-500 hover:underline cursor-pointer font-medium">Ver avaliação</span>
                        </div>
                      ) : (
                        <button className="text-[11px] font-semibold text-blue-500 hover:text-blue-600 hover:underline transition-all">
                          Avaliar
                        </button>
                      )}
                    </div>

                    {/* Tempo relativo decorrido */}
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap self-start md:self-center pt-1 md:pt-0">
                      {pedido.tempo_passado}
                    </span>

                  </div>
                </div>
              ))}

              {/* Estado vazio caso não existam pedidos no filtro selecionado */}
              {pedidosFiltrados.length === 0 && (
                <div className="p-12 text-center text-gray-400 font-medium text-sm">
                  Nenhum serviço encontrado nesta categoria.
                </div>
              )}
            </div>
            
          </div>
        </div>

        {/* Rodapé Padrão */}
        <footer className="text-center text-[11px] text-gray-400 py-4 border-t border-gray-100 bg-white shrink-0 flex justify-center gap-4">
          <p className="hover:underline cursor-pointer">Política de Privacidade - Termos</p>
          <p>© 2026 Benvi</p>
        </footer>

      </main>
    </section>
  );
}