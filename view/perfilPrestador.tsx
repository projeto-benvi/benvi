import { Star } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
        <div className="text-[#1F2937] p-4 sm:p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-4 sm:gap-5">
          <BotaoVoltarDinamico />
          <h1 className="text-xl sm:text-2xl font-bold -mt-1">Perfil Profissional</h1>
          <section className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">Prestador não encontrado</h1>
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

  const todosServicos = await servicoService.buscarPorPrestador(idPrestador) || [];
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

      <div className="text-[#1F2937] p-4 sm:p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-4 sm:gap-5">

        <BotaoVoltarDinamico />

        <h1 className="text-xl sm:text-2xl font-bold -mt-1">Perfil Profissional</h1>

        {/* CARD PRINCIPAL DO PERFIL */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible relative">

          {/* Banner Colorido Superior */}
          <div
            className="w-full min-h-28 sm:min-h-32 rounded-t-2xl flex flex-nowrap justify-center sm:justify-end items-start gap-1 sm:gap-3 p-2.5 sm:p-5"
            style={{ background: "linear-gradient(135deg, #83A5EE 0%, #76DA94 100%)" }}
          >
            {ehDonoDoPerfil ? (
              <a
                href="/tela-configuracoes"
                className="bg-white text-blue-600 font-bold text-[11px] sm:text-sm px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
              >
                Editar perfil
              </a>
            ) : (
              <>
                <a
                  href={`/mensagens?idPrestador=${idPrestador}`}
                  className="bg-white text-blue-600 font-bold text-[11px] sm:text-sm px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
                >
                  Conversar no chat
                </a>
                <div className="scale-[0.82] sm:scale-100 origin-top">
                  <FavoritarPrestadorButton idPrestador={idPrestador} />
                </div>
                <a
                  href={`/avaliacoes?prestador=${idPrestador}`}
                  className="bg-white text-amber-600 font-bold text-[11px] sm:text-sm px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
                >
                  Avaliar prestador
                </a>
              </>
            )}
          </div>

          {/* Área de Informações Alinhada */}
          <div className="px-4 sm:px-6 md:px-9 pb-6 sm:pb-7 pt-0 flex flex-col md:grid md:grid-cols-[148px_minmax(0,1fr)_170px_170px] items-center md:items-end gap-4 sm:gap-5 md:gap-6">

            {/* Foto de Perfil e categoria */}
            <div className="-mt-10 sm:-mt-12 flex flex-col items-center gap-2 self-start md:items-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-white relative flex-shrink-0 flex items-center justify-center">
                {prestador.foto_perfil ? (
                  <img
                    src={prestador.foto_perfil}
                    alt={prestador.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold uppercase select-none">
                    {prestador.nome.charAt(0)}
                  </div>
                )}
              </div>
              <span className="w-full max-w-[148px] truncate bg-blue-600 text-center text-white font-bold text-[10px] px-3 py-1 rounded-full shadow-sm">
                {prestador.categoria_principal}
              </span>
            </div>

            {/* Nome e dados principais */}
            <div className="min-w-0 flex flex-col justify-end pb-1 md:pb-2 text-center md:text-left">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 break-words leading-tight">{prestador.nome}</h2>
              <p className="text-xs text-gray-400 font-semibold mt-1">{prestador.cidade}</p>
            </div>

            {/* Estatísticas: 2 colunas no mobile, colunas próprias no desktop */}
            <div className="w-full grid grid-cols-2 md:contents gap-4">
              {/* Média de Avaliações */}
              <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:py-2 md:self-stretch">
                <div className="flex items-center gap-1.5">
                  <Star className="text-amber-400 fill-amber-400 w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-lg sm:text-xl font-bold text-gray-800">
                    {mediaNota > 0 ? mediaNota.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "--"}
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs text-gray-400 font-semibold mt-1 text-center">Média de avaliações</span>
              </div>

              {/* Serviços Concluídos */}
              <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:py-2 md:self-stretch">
                <span className="text-lg sm:text-xl font-bold text-gray-800">{totalServicosConcluidos}</span>
                <span className="text-[11px] sm:text-xs text-gray-400 font-semibold mt-1 text-center">Serviços concluídos</span>
              </div>
            </div>

          </div>
        </div>

        {/* CORPO DO PERFIL (SOBRE / SERVIÇOS / AVALIAÇÕES) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
            <section className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
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

            <section className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-gray-800">Serviços concluídos</h2>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4">
                {servicosDoPerfil.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Nenhum serviço registrado para este profissional.</p>
                ) : (
                  servicosDoPerfil.map((servico: any) => {
                    const categoriaServico =
                      servico.nome_categoria ||
                      servico.categoria_principal ||
                      prestador.categoria_principal;

                    return (
                      <div key={servico.id_servico} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <CategoriaIcon nome={categoriaServico} className="w-7 h-7 sm:w-8 sm:h-8" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-gray-800 break-words">{servico.titulo}</h3>
                            <p className="text-xs text-gray-500">{categoriaServico}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {servico.data_fim ? new Date(servico.data_fim).toLocaleDateString("pt-BR") : "Recentemente"}
                            </p>
                          </div>
                        </div>
                        <span className="self-start sm:self-auto bg-[#ECFDF5] text-[#10B981] text-xs font-bold px-3 py-1.5 rounded-full capitalize shrink-0">
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
            <section className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
              <h2 className="text-sm font-bold text-gray-800 mb-4 sm:mb-5">Avaliações recentes</h2>
              <div className="flex flex-col gap-5 sm:gap-6">
                {avaliacoesRecentes.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Nenhuma avaliação encontrada.</p>
                ) : (
                  avaliacoesRecentes.map((avaliacao: any, index: number) => {
                    const nomeAvaliador = avaliacao.nome || avaliacao.nome_usuario || avaliacao.usuario?.nome || "Cliente";
                    const inicialAvaliador = nomeAvaliador?.charAt(0).toUpperCase() || "C";

                    return (
                      <div key={avaliacao.id_avaliacao} className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
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
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-gray-800 truncate">{nomeAvaliador}</h3>
                              <span className="text-xs text-amber-500 font-bold">★ {Number(avaliacao.nota || 0).toFixed(1)}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {avaliacao.data_avaliacao ? new Date(avaliacao.data_avaliacao).toLocaleDateString("pt-BR") : ""}
                          </span>
                        </div>
                        <p className="text-xs italic text-gray-500 pl-1 break-words">"{avaliacao.comentario}"</p>
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