import { ArrowLeft, Star } from "lucide-react";
import SearchBar from "@/components/searchBar"; 
import { servicoService } from "@/service/servicoService";
import { usuarioService } from "@/service/usuarioService"; 
import BotaoVoltarDinamico from "@/components/BotaoVoltarDinamico";
import * as avaliacaoModulo from "@/service/avaliacaoService";
const AvaliacaoService = (avaliacaoModulo as any).AvaliacaoService || (avaliacaoModulo as any).avaliacaoService;

export const dynamic = 'force-dynamic';

interface PerfilPrestadorViewProps {
  id: string;
}

export default async function PerfilPrestadorView({ id }: PerfilPrestadorViewProps)  {

  console.log("ID recebido para o perfil do prestador:", id); 
  const idPrestador = id ? parseInt(id) : 1;

  // Perfil público: não depende de sessão para abrir.
  const ehDonoDoPerfil = false;

  // 2. BUSCA CORRETA: Buscar os dados REAIS do usuário/prestador diretamente do banco
  let dadosUsuario = null;
  try {
    dadosUsuario = await usuarioService.buscarPorId(idPrestador); 
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
  }

  // Ignora a tipagem estrita do modelo antigo de Usuario para aceitar os novos campos dinâmicos do banco
  const dadosUsuarioAny = dadosUsuario as any;

  // 3. Busca a lista de serviços desse prestador
  const todosServicos = await servicoService.buscarPorPrestador(idPrestador) || [];

  // 4. Monta o objeto do prestador tratando chaves legadas e novas sem quebrar o TypeScript
  const prestador = {
    nome: dadosUsuarioAny?.nome || dadosUsuarioAny?.name || `Prestador ID: ${idPrestador}`,
    foto_perfil: dadosUsuarioAny?.foto_perfil || dadosUsuarioAny?.avatar || dadosUsuarioAny?.image || "",
    cidade: dadosUsuarioAny?.cidade || "Não informada",
    descricao_profissional: dadosUsuarioAny?.descricao_profissional || "Nenhuma descrição profissional informada ainda.",
    categoria_principal: dadosUsuarioAny?.categoria_principal || "Prestador",
  };

  // 5. Busca as avaliações
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

  const totalNotas = avaliacoesDoPrestador.reduce((acc: number, curr: any) => acc + Number(curr.nota || 0), 0);
  const mediaNota = avaliacoesDoPrestador.length > 0 ? totalNotas / avaliacoesDoPrestador.length : 0;

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB]">
      
      <SearchBar />

      <div className="text-[#1F2937] p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-5">
        
        <BotaoVoltarDinamico />

        <h1 className="text-2xl font-bold -mt-1">Perfil Profissional</h1>

        {/* CARD PRINCIPAL DO PERFIL */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible relative">
          
          {/* Banner Colorido Superior */}
          <div 
            className="w-full h-32 rounded-t-2xl flex justify-end items-start p-5"
            style={{ background: "linear-gradient(135deg, #83A5EE 0%, #76DA94 100%)" }}
          >
            {ehDonoDoPerfil && (
              <button className="bg-white text-blue-600 font-bold text-sm px-5 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-all cursor-pointer">
                Editar perfil
              </button>
            )}
          </div>

          {/* Área de Informações Alinhada */}
          <div className="px-8 pb-6 pt-14 grid grid-cols-1 md:grid-cols-3 items-center relative gap-6 md:gap-0">
            
            {/* Foto de Perfil, Nome e Categoria acoplados */}
            <div className="absolute left-8 -top-14 flex flex-col items-center gap-2 w-32">
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
              <span className="bg-blue-600 text-white font-bold text-[11px] px-4 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                {prestador.categoria_principal}
              </span>
            </div>

            {/* Nome e Cidade posicionados ao lado da foto */}
            <div className="flex flex-col mt-12 md:mt-0 pl-0 md:pl-32 col-span-1 md:col-span-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-800 truncate max-w-full">{prestador.nome}</h2>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">{prestador.cidade}</p>
            </div>

            {/* Média de Avaliações */}
            <div className="flex flex-col items-center justify-center md:border-r border-gray-100 py-2 mt-0 md:mt-0">
              <div className="flex items-center gap-1.5">
                <Star className="text-amber-400 fill-amber-400 w-6 h-6" />
                <span className="text-xl font-bold text-gray-800">
                  {mediaNota > 0 ? mediaNota.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "--"}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-semibold mt-1">Média de avaliações</span>
            </div>

            {/* Serviços Concluídos */}
            <div className="flex flex-col items-center justify-center py-2">
              <span className="text-xl font-bold text-gray-800">{todosServicos.length}</span>
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
            </section>

            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-gray-800">Serviços concluídos</h2>
                <a 
                  href={`/servicos-prestador?id=${idPrestador}`}
                  className="text-xs font-bold text-blue-500 hover:underline cursor-pointer"
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
                            <h3 className="text-sm font-bold text-gray-800">{servico.titulo}</h3>
                            <p className="text-xs text-gray-500">{prestador.cidade}</p>
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
                            <h3 className="text-sm font-bold text-gray-800">Cliente</h3>
                            <span className="text-xs text-amber-500 font-bold">★ {Number(avaliacao.nota || 0).toFixed(1)}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {avaliacao.data_avaliacao ? new Date(avaliacao.data_avaliacao).toLocaleDateString("pt-BR") : ""}
                        </span>
                      </div>
                      <p className="text-xs italic text-gray-500 pl-1">"{avaliacao.comentario}"</p>
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