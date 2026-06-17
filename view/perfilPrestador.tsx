import { ArrowLeft, Star } from "lucide-react";
import SearchBar from "@/components/searchBar"; 
import { servicoService } from "@/service/servicoService";

import * as avaliacaoModulo from "@/service/avaliacaoService";
const AvaliacaoService = (avaliacaoModulo as any).AvaliacaoService || (avaliacaoModulo as any).avaliacaoService;

// FORÇA O NEXT.JS A NUNCA GUARDAR CACHE DESTA PÁGINA
export const dynamic = 'force-dynamic';

interface PerfilPrestadorViewProps {
  id: string;
}

export default async function PerfilPrestadorView({ id }: PerfilPrestadorViewProps)  {

  console.log("ID recebido para o perfil do prestador:", id); 
  const idPrestador = id ? parseInt(id) : 1;
  console.log("Executando busca no banco para o ID:", idPrestador);

  const todosServicos = await servicoService.buscarPorPrestador(idPrestador) || [];
  const primeiroServico = todosServicos[0] as any;

  const prestador = primeiroServico ? {
    nome: primeiroServico.nome_prestador,
    foto_perfil: primeiroServico.foto_prestador,
    cidade: primeiroServico.cidade_prestador,
    descricao_profissional: primeiroServico.descricao_profissional || "Nenhuma descrição informada.",
    categoria_principal: primeiroServico.categoria_principal || "Desenvolvedor",
  } : {
    nome: `Prestador ID: ${idPrestador} (Sem serviços no banco)`, 
    foto_perfil: "",
    cidade: "Não disponível",
    descricao_profissional: "Este prestador ainda não possui serviços vinculados no banco de dados para puxar o perfil.",
    categoria_principal: "Desconhecido",
  };

  // 3. Busca e filtra as avaliações
  let avaliacoesDoPrestador: any[] = [];
  try {
    if (AvaliacaoService && typeof AvaliacaoService.listar === "function") {
      const resultadoAvaliacoes = await AvaliacaoService.listar();
      const todasAvaliacoes = Array.isArray(resultadoAvaliacoes) ? resultadoAvaliacoes : [];
      avaliacoesDoPrestador = todasAvaliacoes.filter((a: any) => a && Number(a.id_prestador) === idPrestador);
    }
  } catch (e) {
    avaliacoesDoPrestador = [];
  }

  // 4. Calcula a média matemática das notas
  const totalNotas = avaliacoesDoPrestador.reduce((acc: number, curr: any) => acc + Number(curr.nota || 0), 0);
  const mediaNota = avaliacoesDoPrestador.length > 0 ? totalNotas / avaliacoesDoPrestador.length : 0;

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB]">
      
      {/* CORRIGIDO: Tag agora em PascalCase para referenciar o componente customizado */}
      <SearchBar />

      <div className="text-[#1F2937] p-6 w-full">
        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition mb-4">
          <ArrowLeft size={16} />
          Voltar
        </button>

        <h1 className="text-2xl font-bold mb-6">Perfil Profissional</h1>

        {/* Card do Prestador */}
        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div 
            className="h-32 w-full flex justify-end items-start p-4"
            style={{ background: "linear-gradient(45deg, #83A5EE 0%, #76DA94 100%)" }}
          >
            <button className="bg-white text-[#2563EB] font-bold text-sm px-6 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition">
              Editar perfil
            </button>
          </div>

          <div className="px-8 pb-6 pt-16 relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="absolute -top-16 left-8 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-md">
                <img 
                  src={prestador.foto_perfil || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200"} 
                  alt={prestador.nome} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="mt-2 bg-[#2563EB] text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm">
                {prestador.categoria_principal}
              </span>
            </div>

            <div className="w-28 h-12 hidden md:block" />

            <div className="flex flex-1 items-center justify-start md:justify-center gap-12 md:gap-20 mt-6 md:mt-0">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-1 text-2xl font-bold">
                  <Star className="text-amber-400 fill-amber-400" size={24} />
                  {mediaNota.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </div>
                <p className="text-xs text-gray-500 font-medium">Média de avaliações</p>
              </div>

              <div className="h-10 w-px bg-gray-200" />

              <div className="flex flex-col items-center text-center">
                <span className="text-2xl font-bold">{todosServicos.length}</span>
                <p className="text-xs text-gray-500 font-medium">Serviços concluídos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold mb-3">Sobre</h2>
              <p className="text-sm leading-relaxed text-gray-600">
                {prestador.descricao_profissional}
              </p>
            </section>

            {/* Listagem de Serviços */}
            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Serviços concluídos</h2>
                <a 
                  href={`/servicos-prestador?id=${idPrestador}`}
                  className="text-sm font-semibold text-[#2563EB] hover:text-[#1d4ed8] transition-colors"
                >
                  Ver tudo
                </a>
              </div>

              <div className="flex flex-col gap-4">
                {todosServicos.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Nenhum serviço registrado para este profissional.</p>
                ) : (
                  todosServicos.map((servico: any) => {
                    let listaImagens: string[] = [];
                    try {
                      if (servico.imagens) {
                        listaImagens = typeof servico.imagens === "string" ? JSON.parse(servico.imagens) : servico.imagens;
                      }
                    } catch (e) {
                      listaImagens = [];
                    }
                    const imgPlaceholder = listaImagens[0] || "https://images.unsplash.com/photo-1608613304899-ea8098577e38?w=150";

                    return (
                      <div key={servico.id_servico} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4">
                          <img src={imgPlaceholder} alt={servico.titulo} className="w-16 h-16 rounded-xl object-cover" />
                          <div>
                            <h3 className="text-sm font-bold">{servico.titulo}</h3>
                            <p className="text-xs text-gray-500">{prestador.cidade || "Localização não informada"}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {servico.data_fim ? new Date(servico.data_fim).toLocaleDateString("pt-BR") : "Recentemente"}
                            </p>
                          </div>
                        </div>
                        <span className="bg-[#ECFDF5] text-[#10B981] text-xs font-bold px-3 py-1.5 rounded-full capitalize">
                          {servico.status_servico}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* Seção Lateral de Avaliações */}
          <div className="lg:col-span-1">
            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Avaliações recentes</h2>
              <div className="flex flex-col gap-6">
                {avaliacoesDoPrestador.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Nenhuma avaliação encontrada.</p>
                ) : (
                  avaliacoesDoPrestador.map((avaliacao: any, index: number) => (
                    <div key={avaliacao.id_avaliacao} className="flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold">Cliente</h3>
                            <span className="text-xs text-amber-500 font-bold">★ {Number(avaliacao.nota || 0).toFixed(1)}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {avaliacao.data_avaliacao ? new Date(avaliacao.data_avaliacao).toLocaleDateString("pt-BR") : ""}
                        </span>
                      </div>
                      <p className="text-xs italic text-gray-600 pl-1">"{avaliacao.comentario}"</p>
                      {index < avaliacoesDoPrestador.length - 1 && <div className="w-full h-px bg-gray-100 mt-2" />}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}