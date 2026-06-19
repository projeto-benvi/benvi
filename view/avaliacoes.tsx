"use client";
import SearchBar from "@/components/searchBar";
import { MessageSquareText } from "lucide-react";
import { useState } from "react";



export default function Avaliacoes() {

    const [filtroEstrela, setFiltroEstrela] = useState<number | null>(null);
    const [ordem, setOrdem] = useState("recentes");

    const avaliacoes = [
    {
        id: 1,
        nome: "Maria Aparecida",
        foto: "/clientes/maria.jpg",
        servico: "Instalação de torneira",
        data: "10 de maio de 2026",
        nota: 5,
        comentario:
        "Excelente profissional! Resolveu o problema rapidamente e foi muito atencioso.",
        tags: [
        "⏱ Pontualidade",
        "✂ Qualidade do serviço",
        "👤 Educação e atendimento",
        "💰 Custo benefício",
        ],
    },
    {
        id: 2,
        nome: "João Pereira",
        servico: "Instalação elétrica",
        nota: 5,
        data: "2026-04-20",
        comentario:
        "Muito bom atendimento e serviço de qualidade.",
        tags: ["Qualidade do serviço"],
    },
    {
        id: 3,
        nome: "Ana Costa",
        servico: "Limpeza residencial",
        nota: 3,
        data: "2026-03-15",
        comentario:
        "Serviço bom, mas demorou um pouco.",
        tags: ["Educação"],
    },
    ];

    const avaliacoesFiltradas = avaliacoes
    .filter((avaliacao) =>
        filtroEstrela === null
        ? true
        : avaliacao.nota === filtroEstrela
    )
    .sort((a, b) => {
        if (ordem === "recentes") {
        return (
            new Date(b.data).getTime() -
            new Date(a.data).getTime()
        );
        }

        return (
        new Date(a.data).getTime() -
        new Date(b.data).getTime()
        );
    });

  return (
    <div className="h-screen flex flex-col bg-[#F8F8F8]">
        <div className="border-b border-[#CDCDCD] shrink-0">
            <SearchBar />
        </div>
        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-[#FBE8D8] flex items-center justify-center">
            <MessageSquareText />
            </div>

            <div>
            <h1 className="text-3xl font-semibold">
                Avaliações recebidas
            </h1>

            <p className="text-gray-500">
                Veja o que os clientes dizem sobre o seu trabalho
            </p>
            </div>
        </div>

        {/* Estatísticas */}
        <div className="flex gap-4 mb-8 items-end">

            {/* Nota geral */}
            <div className="bg-white border border-[#E2D5D5] rounded-xl p-6 w-[220px] border shadow-md">

            <h3 className="font-semibold">
                Nota média geral
            </h3>

            <div className="text-center mt-4">
                <span className="text-5xl font-bold">
                4,8
                </span>
            </div>

            <div className="text-center text-yellow-400 text-2xl mt-3">
                ★★★★★
            </div>

            <p className="text-xs text-center text-gray-400 mt-3">
                Baseado em 128 avaliações
            </p>

            </div>

            {/* Cards estrelas */}
            <div className="flex gap-2 flex-wrap ">

            <div className="bg-white border border-[#E2D5D5] rounded-xl p-3 w-[140px] h-[165px] shadow-md flex flex-col">
                <p className="font-medium">⭐ 5 estrelas</p>

                <p className="text-2xl font-semibold text-center mt-3">
                98
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
                <div className="w-[76%] h-2 bg-blue-500 rounded-full"></div>
                </div>

                <p className="text-xs text-right text-gray-400 mt-2">
                76,6%
                </p>
            </div>

            <div className="bg-white border border-[#E2D5D5] rounded-xl p-3 w-[140px] shadow-md">
                <p className="font-medium">⭐ 4 estrelas</p>

                <p className="text-2xl font-semibold text-center mt-3">
                20
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
                <div className="w-[16%] h-2 bg-blue-500 rounded-full"></div>
                </div>

                <p className="text-xs text-right text-gray-400  mt-2">
                15,6%
                </p>
            </div>

            <div className="bg-white border border-[#E2D5D5] rounded-xl p-3 w-[140px] shadow-md">
                <p className="font-medium">⭐ 3 estrelas</p>

                <p className="text-2xl font-semibold text-center mt-3">
                6
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
                <div className="w-[5%] h-2 bg-blue-500 rounded-full"></div>
                </div>

                <p className="text-xs text-right text-gray-400 mt-2">
                4,7%
                </p>
            </div>

            <div className="bg-white border border-[#E2D5D5] rounded-xl p-3 w-[140px] shadow-md">
                <p className="font-medium">⭐ 2 estrelas</p>

                <p className="text-2xl font-semibold text-center mt-3">
                3
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
                <div className="w-[2%] h-2 bg-blue-500 rounded-full"></div>
                </div>

                <p className="text-xs text-right text-gray-400 mt-2">
                2,3%
                </p>
            </div>

            <div className="bg-white border border-[#E2D5D5] rounded-xl p-3 w-[140px] shadow-md">
                <p className="font-medium">⭐ 1 estrela</p>

                <p className="text-2xl font-semibold text-center mt-3">
                1
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
                <div className="w-[1%] h-2 bg-blue-500 rounded-full"></div>
                </div>

                <p className="text-xs text-right text-gray-400 mt-2">
                0,8%
                </p>
            </div>

            </div>
        </div>

        {/* Conteúdo */}
        <div className="flex gap-6">

            {/* Lista avaliações */}
            <div className="flex-1">

            {/* Filtros */}
            <div className="flex gap-8 border-b mb-6">

                <button
                onClick={() => setFiltroEstrela(null)}
                className={`
                    cursor-pointer
                    pb-3 font-medium
                    ${filtroEstrela === null
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"}
                `}
                >
                Todas (128)
                </button>

                <button
                onClick={() => setFiltroEstrela(5)}
                className={`
                    cursor-pointer
                    pb-3
                    ${filtroEstrela === 5
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"}
                `}
                >
                5 estrelas (98)
                </button>

                <button
                onClick={() => setFiltroEstrela(4)}
                className={`
                    cursor-pointer
                    pb-3
                    ${filtroEstrela === 4
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"}
                `}
                >
                4 estrelas (98)
                </button>

                <button
                onClick={() => setFiltroEstrela(3)}
                className={`
                    cursor-pointer
                    pb-3
                    ${filtroEstrela === 3
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"}
                `}
                >
                3 estrelas (98)
                </button>

                <button
                onClick={() => setFiltroEstrela(2)}
                className={`
                    cursor-pointer
                    pb-3
                    ${filtroEstrela === 2
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"}
                `}
                >
                2 estrelas (98)
                </button>

                <button
                onClick={() => setFiltroEstrela(1)}
                className={`
                    cursor-pointer
                    pb-3
                    ${filtroEstrela === 1
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"}
                `}
                >
                1 estrelas (98)
                </button>

                

            </div>

            {/* Avaliação */}
            {avaliacoesFiltradas.map((avaliacao) => (
  <div
    key={avaliacao.id}
    className="
      bg-white
      border border-[#E2D5D5]
      rounded-2xl
      p-4
      mb-3
      relative
    "
  >
    {/* Menu */}
    <button
      className="
        absolute
        top-4
        right-4
        text-gray-400
        hover:text-gray-600
      "
    >
      ⋮
    </button>

    <div className="flex gap-5">

      {/* Foto */}
      <div className="w-20 h-20 rounded-full bg-gray-300 shrink-0 overflow-hidden">
        {avaliacao.foto && (
          <img
            src={avaliacao.foto}
            alt={avaliacao.nome}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Dados cliente */}
      <div className="w-[170px] shrink-0">

        <h3 className="font-bold text-xl">
          {avaliacao.nome}
        </h3>

        <p className="text-sm text-gray-400 mt-1">
          Serviço: {avaliacao.servico}
        </p>

        <p className="text-sm text-gray-400">
          {avaliacao.data}
        </p>

      </div>

      {/* Conteúdo avaliação */}
      <div className="flex-1">

        <div className="flex items-center gap-2">

          <div className="text-yellow-400 text-lg">
            {"★".repeat(avaliacao.nota)}
          </div>

          <span className="text-gray-800">
            {avaliacao.nota},0
          </span>

        </div>

        <p className="mt-2 text-gray-800">
          "{avaliacao.comentario}"
        </p>

        <div className="flex flex-wrap gap-2 mt-4">

          {avaliacao.tags.map((tag) => (
            <span
              key={tag}
              className="
                border
                border-[#D9D9D9]
                rounded-lg
                px-3
                py-1
                text-xs
                text-gray-700
              "
            >
              {tag}
            </span>
          ))}

        </div>

      </div>

    </div>
  </div>
))}

            </div>

            {/* Sidebar */}
            <aside className="w-[280px]">
                <div className="flex justify-end mb-4">
                    <select
                    value={ordem}
                    onChange={(e) => setOrdem(e.target.value)}
                    className="
                        bg-white
                        border border-[#E2D5D5]
                        rounded-lg
                        px-4
                        py-2
                        text-sm
                        text-gray-600
                        shadow-sm
                        cursor-pointer
                        outline-none
                    "
                    >
                    <option value="recentes">
                        Mais recentes
                    </option>

                    <option value="antigas">
                        Mais antigas
                    </option>
                    </select>
                </div>

            <div className="
            bg-white
            border border-[#E2D5D5]
            rounded-2xl
            w-[250px]
            overflow-hidden
            shadow-sm
            ">
            <div className="p-5">
                <h3 className="font-semibold text-[18px]">
                Resumo das avaliações
                </h3>
            </div>

            <div className="border-t border-[#EAEAEA] p-5 flex justify-between items-center">
                <div>
                <p className="text-gray-400 text-sm font-medium">
                    Avaliações nos últimos
                </p>

                <p className="text-gray-400 text-sm font-medium">
                    30 dias
                </p>
                </div>

                <span className="text-4xl font-bold">
                24
                </span>
            </div>

            <div className="border-t border-[#EAEAEA] p-5 flex justify-between items-center">
                <p className="text-gray-400 text-sm font-medium">
                Clientes avaliados
                </p>

                <span className="text-4xl font-bold">
                87
                </span>
            </div>

            <div className="border-t border-[#EAEAEA] p-5">
                <p className="text-gray-400 text-sm font-medium mb-3">
                Mais avaliado
                </p>

                <span className="
                inline-flex
                items-center
                gap-2
                border
                border-[#E2D5D5]
                rounded-lg
                px-3
                py-2
                text-sm
                ">
                🛠️ Qualidade do serviço
                </span>
            </div>
            </div>

            </aside>

        </div>
        </div>
    </div>
  );
}