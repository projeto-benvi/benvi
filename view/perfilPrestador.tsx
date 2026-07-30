import { Star } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SearchBar from "@/components/searchBar"; 
import { servicoService } from "@/service/servicoService";
import { prestadorService } from "@/service/prestadorService"; 
import BotaoVoltarDinamico from "@/components/BotaoVoltarDinamico";
import FavoritarPrestadorButton from "@/components/FavoritarPrestadorButton";
import { CategoriaIcon } from "@/components/CategoriaIcon";
import * as avaliacaoModulo from "@/service/avaliacaoService";
import Link from "next/link";
const AvaliacaoService = (avaliacaoModulo as any).AvaliacaoService || (avaliacaoModulo as any).avaliacaoService;

export const dynamic = 'force-dynamic';

interface PerfilPrestadorViewProps {
  id: string;
}

export default async function PerfilPrestadorView({ id }: PerfilPrestadorViewProps)  {
  const idPrestador = id ? parseInt(id) : 1;

  const session = await getServerSession(authOptions);
  const usuarioLogado = session?.user as any;
  const ehDonoDoPerfil = Boolean(
    usuarioLogado?.isPrestador && Number(usuarioLogado?.id) === idPrestador
  );

  let dadosPrestador = null;
  try {
    dadosPrestador = await prestadorService.buscarPorId(idPrestador);
  } catch (error) {
    console.error("Erro ao buscar dados profissionais:", error);
  }

  const dadosPrestadorAny = dadosPrestador as any;

  if (!dadosPrestadorAny) {
    return (
      <div className="w-full min-h-screen bg-[#F9FAFB]">
        <SearchBar />
        <div className="text-[#1F2937] p-4 sm:p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-5">
          <BotaoVoltarDinamico />
          <h1 className="text-2xl font-bold -mt-1">Perfil Profissional</h1>
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h1 className="text-xl font-bold text-gray-800">Prestador não encontrado</h1>
            <p className="mt-2 text-sm text-gray-500">Este perfil não existe ou não está mais disponível.</p>
            <Link href="/buscar" className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
              Buscar outros profissionais
            </Link>
          </section>
        </div>
      </div>
    );
  }

  const categoriasSecundarias = Array.isArray(dadosPrestadorAny.categorias_vinculadas)
    ? dadosPrestadorAny.categorias_vinculadas
        .map((categoria: any) => categoria?.nome_categoria)
        .filter(Boolean)
    : [];

  const resultadoServicos = await servicoService.buscarPorPrestador(idPrestador, { pagina: 1, limite: 20, offset: 0 });
  const todosServicos = resultadoServicos?.dados ?? [];
  const servicosConcluidos = todosServicos.filter((servico: any) => {
    const statusServico = String(servico.status_servico || "").toLowerCase();
    return statusServico === "concluido" || statusServico === "concluído";
  });
  const servicosDoPerfil = (servicosConcluidos.length > 0 ? servicosConcluidos : todosServicos).slice(0, 5);

  const prestador = {
    nome: dadosPrestadorAny.nome || dadosPrestadorAny.name || `Prestador ID: ${idPrestador}`,
    foto_perfil: dadosPrestadorAny.foto_perfil || dadosPrestadorAny.avatar || dadosPrestadorAny.image || "",
    cidade: dadosPrestadorAny.cidade || "Não informada",
    descricao_profissional: dadosPrestadorAny.descricao_profissional || "Nenhuma descrição profissional informada ainda.",
    categoria_principal: dadosPrestadorAny.categoria_principal || "Prestador",
    media_nota: Number(dadosPrestadorAny.media_nota || 0),
    total_avaliacoes: Number(dadosPrestadorAny.total_avaliacoes || 0),
    servicos_concluidos: Number(dadosPrestadorAny.servicos_concluidos || 0),
  };

  // 5. Busca as avaliações
  let avaliacoesDoPrestador: any[] = [];
  try {
    if (AvaliacaoService && typeof AvaliacaoService.listarPorPrestador === "function") {
      const resultadoAvaliacoes = await AvaliacaoService.listarPorPrestador(idPrestador);
      avaliacoesDoPrestador = Array.isArray(resultadoAvaliacoes) ? resultadoAvaliacoes : [];
    } else if (AvaliacaoService && typeof AvaliacaoService.listar === "function") {
      const resultadoAvaliacoes = await AvaliacaoService.listar();
      const todasAvaliacoes = Array.isArray(resultadoAvaliacoes) ? resultadoAvaliacoes : [];
      avaliacoesDoPrestador = todasAvaliacoes.filter((a: any) => a && Number(a.id_prestador) === idPrestador);
    }
  } catch (e) {
    avaliacoesDoPrestador = [];
  }

  const totalNotas = avaliacoesDoPrestador.reduce((acc: number, curr: any) => acc + Number(curr.nota || 0), 0);
  const mediaNota = avaliacoesDoPrestador.length > 0 ? totalNotas / avaliacoesDoPrestador.length : prestador.media_nota;
  const avaliacoesRecentes = avaliacoesDoPrestador.slice(0, 5);
  const totalServicosConcluidos = prestador.servicos_concluidos || servicosConcluidos.length;

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB]">
      
      <SearchBar />

      <div className="text-[#1F2937] p-4 sm:p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-5">
      
        <BotaoVoltarDinamico />

        <h1 className="text-2xl font-bold -mt-1">Perfil Profissional</h1>

        {/* CARD PRINCIPAL DO PERFIL */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible relative">
          
          {/* Banner Colorido Superior */}
          <div 
            className="w-full min-h-32 rounded-t-2xl flex flex-wrap justify-end items-start gap-3 p-5"
            style={{ background: "linear-gradient(135deg, #83A5EE 0%, #76DA94 100%)" }}
          >
            {ehDonoDoPerfil ? (
              <a
                href="/tela-configuracoes"
                className="bg-white text-blue-600 font-bold text-sm px-5 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
              >
                Editar perfil
              </a>
            ) : (
              <>
                <a
                  href={`/mensagens?idPrestador=${idPrestador}`}
                  className="bg-white text-blue-600 font-bold text-sm px-5 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Conversar no chat
                </a>
                <FavoritarPrestadorButton idPrestador={idPrestador} />
                <a
                  href={`/avaliacoes?prestador=${idPrestador}`}
                  className="bg-white text-amber-600 font-bold text-sm px-5 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Avaliar prestador
                </a>
              </>
            )}
          </div>

          {/* Área de Informações Alinhada */}
          <div className="px-6 md:px-9 pb-7 pt-0 grid grid-cols-1 md:grid-cols-[148px_minmax(0,1fr)_170px_170px] items-end gap-5 md:gap-6">
            
            {/* Foto de Perfil e categoria */}
            <div className="-mt-12 flex flex-col items-center gap-2 self-start md:items-center">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-white relative flex-shrink-0 flex items-center justify-center">
                {prestador.foto_perfil ? (
                  <img 
                    src={prestador.foto_perfil} 
                    alt={prestador.nome} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold uppercase select-none">
                    {prestador.nome.charAt(0)}
                  </div>
                )}
              </div>
              <span className="w-full max-w-[148px] truncate bg-blue-600 text-center text-white font-bold text-[10px] px-3 py-1 rounded-full shadow-sm">
                {prestador.categoria_principal}
              </span>
            </div>

            {/* Nome e dados principais */}
            <div className="min-w-0 flex flex-col justify-end pb-2 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-800 break-words leading-tight">{prestador.nome}</h2>
              <p className="text-xs text-gray-400 font-semibold mt-1">{prestador.cidade}</p>
            </div>

            {/* Média de Avaliações */}
            <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:py-2 md:self-stretch">
              <div className="flex items-center gap-1.5">
                <Star className="text-amber-400 fill-amber-400 w-6 h-6" />
                <span className="text-xl font-bold text-gray-800">
                  {mediaNota > 0 ? mediaNota.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "--"}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-semibold mt-1">Média de avaliações</span>
            </div>

            {/* Serviços Concluídos */}
            <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:py-2 md:self-stretch">
              <span className="text-xl font-bold text-gray-800">{totalServicosConcluidos}</span>
              <span className="text-xs text-gray-400 font-semibold mt-1">Serviços concluídos</span>
            </div>

          </div>
        </div>

        {/* CORPO DO PERFIL (SOBRE / SERVIÇOS / AVALIAÇÕES) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-sm font-bold text-gray-800 mb-2">Sobre</h2>
              <p className="text-sm leading-relaxed text-gray-500">
                {prestador.descricao_profissional}
              </p>
              {categoriasSecundarias.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {categoriasSecundarias.map((categoria: string) => (
                    <span key={categoria} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      {categoria}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-gray-800">Serviços concluídos</h2>
              </div>

              <div className="flex flex-col gap-4">
                {servicosDoPerfil.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Nenhum serviço registrado para este profissional.</p>
                ) : (
                  servicosDoPerfil.map((servico: any) => {
                    const categoriaServico =
                      servico.nome_categoria ||
                      servico.categoria_principal ||
                      prestador.categoria_principal;

                    return (
                      <div key={servico.id_servico} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <CategoriaIcon nome={categoriaServico} className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-800">{servico.titulo}</h3>
                            <p className="text-xs text-gray-500">{categoriaServico}</p>
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

          <div className="lg:col-span-1">
            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-sm font-bold text-gray-800 mb-5">Avaliações recentes</h2>
              <div className="flex flex-col gap-6">
                {avaliacoesRecentes.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Nenhuma avaliação encontrada.</p>
                ) : (
                  avaliacoesRecentes.map((avaliacao: any, index: number) => {
                    const nomeAvaliador = avaliacao.nome || avaliacao.nome_usuario || avaliacao.usuario?.nome || "Cliente";
                    const inicialAvaliador = nomeAvaliador?.charAt(0).toUpperCase() || "C";

                    return (
                      <div key={avaliacao.id_avaliacao} className="flex flex-col gap-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                              {avaliacao.foto_perfil ? (
                                <img
                                  src={avaliacao.foto_perfil}
                                  alt={nomeAvaliador}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                                  {inicialAvaliador}
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-gray-800">{nomeAvaliador}</h3>
                              <span className="text-xs text-amber-500 font-bold">★ {Number(avaliacao.nota || 0).toFixed(1)}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {avaliacao.data_avaliacao ? new Date(avaliacao.data_avaliacao).toLocaleDateString("pt-BR") : ""}
                          </span>
                        </div>
                        <p className="text-xs italic text-gray-500 pl-1">"{avaliacao.comentario}"</p>
                        {index < avaliacoesRecentes.length - 1 && <div className="w-full h-px bg-gray-100 mt-2" />}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
