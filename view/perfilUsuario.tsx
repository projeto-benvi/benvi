"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Star, Wrench, MessageSquareDot } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SearchBar from "@/components/searchBar";
import userAvatar from "@/assets/user.png";
import { useAuth } from "@/hooks/useAuth";

interface Servico {
  id: number;
  titulo: string;
  profissional: string;
  data: string;
  status: "Concluido" | "Avaliar";
  imagemUrl?: string;
}

interface Avaliacao {
  id: number;
  nome: string;
  profissao: string;
  nota: number;
  data: string;
  texto: string;
  avatarUrl?: string;
}

interface Estatisticas {
  mediaAvaliacoes: number;
  totalContratado: number;
  sobre: string;
}

function StarRating({ nota }: { nota: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = nota >= i;
        const half = !filled && nota >= i - 0.5;
        return (
          <span key={i} className="relative w-3.5 h-3.5 inline-block">
            <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-100 absolute inset-0" />
            {(filled || half) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: half ? "50%" : "100%" }}
              >
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default function PerfilUsuario() {
  const router = useRouter();
  const { user, carregando: authCarregando } = useAuth();

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    mediaAvaliacoes: 0,
    totalContratado: 0,
    sobre: "Nenhuma descrição informada ainda.",
  });
  
  const [buscandoDados, setBuscandoDados] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    async function carregarDadosPerfil() {
      try {
        setBuscandoDados(true);
        const resposta = await fetch(`/api/usuarios/perfil?id=${user?.id}`);
        
        if (resposta.ok) {
          const dadosDoBanco = await resposta.json();
          setServicos(dadosDoBanco.servicos || []);
          setAvaliacoes(dadosDoBanco.avaliacoes || []);
          setEstatisticas({
            mediaAvaliacoes: dadosDoBanco.mediaAvaliacoes || 0,
            totalContratado: dadosDoBanco.totalContratado || 0,
            sobre: dadosDoBanco.sobre || "Gosto de praticidade e bom atendimento. Sempre busco profissionais confiáveis.",
          });
        }
      } catch (error) {
        console.error("Erro ao conectar com o banco:", error);
      } finally {
        setBuscandoDados(false);
      }
    }

    carregarDadosPerfil();
  }, [user?.id]);

  if (authCarregando || buscandoDados) {
    return (
      <div className="w-full h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-medium text-sm animate-pulse">Carregando dados do perfil...</p>
      </div>
    );
  }

  const nomeUsuario = user?.nome || "Usuário Benvi";
  const avatarUsuario = user?.avatar || userAvatar;

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col w-full">
      <SearchBar />

      <div className="px-6 py-6 flex flex-col gap-5 w-full max-w-[1200px] mx-auto">
        
        <button 
          onClick={() => window.history.length > 1 ? router.back() : router.push("/")}
          className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700 w-fit transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          Voltar
        </button>

        <h1 className="text-2xl font-bold text-gray-800 -mt-1">Perfil</h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible relative">
          <div
            className="w-full h-32 rounded-t-2xl flex justify-end items-start p-5"
            style={{
              background: "linear-gradient(135deg, #93C5FD 0%, #6EE7B7 100%)",
            }}
          >
            <button className="bg-white text-blue-600 font-bold text-sm px-5 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-all cursor-pointer">
              Editar perfil
            </button>
          </div>

          <div className="px-8 pb-6 pt-14 grid grid-cols-3 items-center relative">
            <div className="absolute left-8 -top-14 flex flex-col items-center gap-2 w-28">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-white relative flex-shrink-0">
                {user?.avatar ? (
                  <Image 
                    src={avatarUsuario} 
                    alt={`Foto de ${nomeUsuario}`} 
                    fill 
                    className="object-cover" 
                    unoptimized={user.avatar.startsWith("http")}
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold uppercase select-none">
                    {nomeUsuario.charAt(0)}
                  </div>
                )}
              </div>
              <h2 className="text-base font-bold text-gray-800 text-center truncate max-w-full w-full">{nomeUsuario}</h2>
              <span className="bg-[#BBF7D0] text-emerald-800 font-bold text-[11px] px-4 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                Cliente
              </span>
            </div>

            <div />

            <div className="flex flex-col items-center justify-center border-r border-gray-100 py-2 mt-12">
              <div className="flex items-center gap-1.5">
                <Star className="text-amber-400 fill-amber-400 w-6 h-6" />
                <span className="text-xl font-bold text-gray-800">
                  {estatisticas.mediaAvaliacoes > 0 ? estatisticas.mediaAvaliacoes.toFixed(1) : "--"}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-semibold mt-1">Média de avaliações</span>
            </div>

            <div className="flex flex-col items-center justify-center py-2 mt-12">
              <span className="text-xl font-bold text-gray-800">{estatisticas.totalContratado}</span>
              <span className="text-xs text-gray-400 font-semibold mt-1">Serviços contratados</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Sobre</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {estatisticas.sobre}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">Serviços contratados</h3>
                {servicos.length > 0 && (
                  <button className="text-xs font-bold text-blue-500 hover:underline cursor-pointer">
                    Ver todos
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {servicos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 p-4">
                    <Wrench className="text-gray-300 w-8 h-8 mb-2" />
                    <p className="text-sm font-medium text-gray-500">Nenhum serviço contratado ainda.</p>
                    <p className="text-xs text-gray-400 mt-0.5">Seus serviços finalizados aparecerão aqui.</p>
                  </div>
                ) : (
                  servicos.map((servico) => (
                    <div
                      key={servico.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0 bg-gray-100 border border-gray-100">
                          {servico.imagemUrl ? (
                            <img
                              src={servico.imagemUrl}
                              alt={servico.titulo}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                              <Wrench size={20} />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">{servico.titulo}</span>
                          <span className="text-xs font-medium text-gray-400 mt-0.5">
                            {servico.profissional}
                          </span>
                          <span className="text-[11px] text-gray-400 mt-0.5">{servico.data}</span>
                        </div>
                      </div>

                      {servico.status === "Concluido" ? (
                        <span className="bg-[#BBF7D0] text-emerald-800 font-bold text-xs px-4 py-1.5 rounded-xl whitespace-nowrap">
                          Concluído
                        </span>
                      ) : (
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-1.5 rounded-xl shadow-sm transition-all whitespace-nowrap cursor-pointer">
                          Avaliar
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-5">Avaliações recentes</h3>

            <div className="flex flex-col gap-5">
              {avaliacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquareDot className="text-gray-300 w-8 h-8 mb-2" />
                  <p className="text-sm font-medium text-gray-500">Nenhuma avaliação realizada.</p>
                </div>
              ) : (
                avaliacoes.map((aval) => (
                  <div
                    key={aval.id}
                    className="flex flex-col border-b border-gray-100 last:border-0 pb-5 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 relative border border-gray-100">
                        {aval.avatarUrl ? (
                          <img
                            src={aval.avatarUrl}
                            alt={aval.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-200 text-zinc-500 flex items-center justify-center text-xs font-bold uppercase">
                            {aval.nome.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-bold text-gray-800 leading-tight truncate">
                            {aval.nome}
                          </span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <StarRating nota={aval.nota} />
                            <span className="text-xs font-bold text-gray-700">
                              {aval.nota.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-xs text-gray-400">{aval.profissao}</span>
                          <span className="text-[10px] text-gray-400">{aval.data}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 italic mt-3 leading-relaxed">
                      "{aval.texto}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}