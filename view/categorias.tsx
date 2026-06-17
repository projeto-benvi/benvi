"use client";

import { useState, useEffect } from "react";
import { 
  FaWrench, 
  FaPaintRoller, 
  FaBroom, 
  FaCut, 
  FaTruck, 
  FaRegSmile, 
  FaSlidersH,
  FaHammer,
  FaSeedling,
  FaLaptopCode,
  FaCamera,
  FaDumbbell,
  FaBookOpen,
  FaBaby,
  FaCar,
  FaMotorcycle,
  FaBirthdayCake
} from "react-icons/fa";

interface Categoria {
  id_categoria?: number;
  nome_categoria: string;
  descricao?: string;
  status?: string;
  data_criacao?: Date;
}

export default function CategoriasView() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState<Categoria[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<string>("Todos");
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  // 1. Definição dos Grupos (Pílulas) e quais palavras-chave pertencem a cada um
  const gruposFiltros = [
    { nome: "Todos", palavrasChave: [] },
    { nome: "Serviços domésticos", palavrasChave: ["diarista", "faxineira", "babá", "cuidador", "costureira", "lavador", "jardineiro"] },
    { nome: "Manutenção", palavrasChave: ["eletricista", "encanador", "ar-condicionado", "informática", "chaveiro", "câmeras", "montador"] },
    { nome: "Construção", palavrasChave: ["pedreiro", "pintor", "gesseiro", "serralheiro", "carpinteiro"] },
    { nome: "Beleza e bem-estar", palavrasChave: ["manicure", "cabeleireiro", "maquiador", "personal"] }
  ];

  useEffect(() => {
    async function carregarCategorias() {
      try {
        const response = await fetch("/api/categoria"); 
        if (!response.ok) {
          throw new Error("Erro ao buscar as categorias do servidor.");
        }
        const dados = await response.json();
        setCategorias(dados);
        setCategoriasFiltradas(dados); // Inicialmente mostra tudo
      } catch (err: any) {
        setErro(err.message || "Algo deu errado.");
      } finally {
        setCarregando(false);
      }
    }
    carregarCategorias();
  }, []);

  // 2. Função que lida com o clique nos filtros
  const aplicarFiltro = (nomeGrupo: string) => {
    setFiltroAtivo(nomeGrupo);
    
    if (nomeGrupo === "Todos") {
      setCategoriasFiltradas(categorias);
      return;
    }

    const grupoSelecionado = gruposFiltros.find(g => g.nome === nomeGrupo);
    if (!grupoSelecionado) return;

    // Filtra as categorias se o nome dela incluir alguma das palavras-chave do grupo
    const filtradas = categorias.filter(cat => {
      const nomeCatNormalizado = cat.nome_categoria.toLowerCase();
      return grupoSelecionado.palavrasChave.some(palavra => nomeCatNormalizado.includes(palavra));
    });

    setCategoriasFiltradas(filtradas);
  };

  // Mapeamento visual avançado para dar um ícone correto a cada profissão da sua imagem
  const renderIcon = (nome: string) => {
    const props = { className: "text-gray-700 w-12 h-12 mb-4" };
    const n = nome.toLowerCase().trim();


    if (n.includes("pintor") || n.includes("pintura")) return <FaPaintRoller {...props} />;
    if (n.includes("eletricista")) return <FaWrench {...props} className="text-yellow-500 w-12 h-12 mb-4" />;
    if (n.includes("encanador")) return <FaWrench {...props} className="text-blue-500 w-12 h-12 mb-4" />;
    if (n.includes("carpinteiro") || n.includes("marceneiro") || n.includes("montador")) return <FaHammer {...props} />;
    if (n.includes("diarista") || n.includes("faxineira")) return <FaBroom {...props} />;
    if (n.includes("jardineiro")) return <FaSeedling {...props} />;
    if (n.includes("informática") || n.includes("social")) return <FaLaptopCode {...props} />;
    if (n.includes("fotógrafo") || n.includes("câmeras")) return <FaCamera {...props} />;
    if (n.includes("manicure") || n.includes("cabeleireiro") || n.includes("maquiador")) return <FaCut {...props} />;
    if (n.includes("personal")) return <FaDumbbell {...props} />;
    if (n.includes("professor")) return <FaBookOpen {...props} />;
 
    if (n.includes("babá")) return <FaBaby {...props} />;
    if (n.includes("lavador")) return <FaCar {...props} />;
    if (n.includes("motoboy")) return <FaMotorcycle {...props} />;

    if (n.includes("confeiteira") || n.includes("decorador")) return <FaBirthdayCake {...props} />;
    if (n.includes("frete") || n.includes("mudança")) return <FaTruck {...props} />;

    return <FaRegSmile {...props} />;
  };

  return (
    <section className="flex w-full h-screen bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header Superior */}
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
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 border border-gray-300">P</div>
          </div>
        </header>

        {/* Container Principal */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1200px] w-full mx-auto">
            
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Todas as categorias</h1>
              <p className="text-gray-400 text-sm">Encontre o profissional ideal que você precisa</p>
            </div>

            {/* 3. Renderização Dinâmica dos Botões de Filtros */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
              {gruposFiltros.map((grupo) => (
                <button
                  key={grupo.nome}
                  onClick={() => aplicarFiltro(grupo.nome)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    filtroAtivo === grupo.nome
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {grupo.nome}
                </button>
              ))}
            </div>

            {carregando && (
              <div className="flex justify-center items-center h-48">
                <p className="text-gray-500 font-medium animate-pulse">Carregando categorias...</p>
              </div>
            )}

            {erro && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">{erro}</div>
            )}

            {/* 4. Grid Dinâmica utilizando o estado 'categoriasFiltradas' */}
            {!carregando && !erro && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categoriasFiltradas.map((cat) => (
                  <div 
                    key={cat.id_categoria} 
                    className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-pointer h-[240px]"
                  >
                    {renderIcon(cat.nome_categoria)}

                    <h3 className="text-base font-bold text-[#1E293B] mb-1 line-clamp-1">{cat.nome_categoria}</h3>
                    <p className="text-xs text-gray-400 mb-4 line-clamp-2 overflow-hidden px-2">
                      {cat.descricao || "Prestadores de serviços qualificados prontos para te atender."}
                    </p>
                    
                    <div className="text-[11px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full mt-auto flex items-center gap-1">
                      <span>👤 Disponíveis na plataforma</span>
                    </div>
                  </div>
                ))}

                {/* Mensagem caso o filtro selecionado não encontre nenhuma categoria */}
                {categoriasFiltradas.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-400 font-medium">Nenhuma categoria encontrada para este filtro.</p>
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