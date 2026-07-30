"use client";
import SearchBar from "@/components/searchBar";
import {
  MessageSquareText,
  CircleDollarSign,
  BadgeCheck,
  Sparkles,
  Clock3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";



export default function Avaliacoes() {

    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const idPrestadorUrl = Number(searchParams.get("prestador") ?? 0);
    const idPrestadorLogado = Number((session?.user as any)?.id ?? 0);
    const idPrestadorAvaliacoes = idPrestadorUrl || idPrestadorLogado;

    const [filtroEstrela, setFiltroEstrela] = useState<number | null>(null);
    const [ordem, setOrdem] = useState("recentes");
    const textoOrdem = ordem === "recentes" ? "Mais recentes" : "Mais antigas";

    const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");


    const avaliacoesFiltradas = avaliacoes
    .filter((avaliacao) =>
        filtroEstrela === null
        ? true
        : Number(avaliacao.nota) === filtroEstrela
    )

    .sort((a, b) => {
        if (ordem === "recentes") {
        return (
            new Date(b.data_avaliacao).getTime() -
            new Date(a.data_avaliacao).getTime()
        );
        }

        return (
        new Date(a.data_avaliacao).getTime() -
        new Date(b.data_avaliacao).getTime()
        );
    });

    const totalAvaliacoes = avaliacoes.length;

    const notaMedia =
    totalAvaliacoes > 0
        ? (
            avaliacoes.reduce(
            (acc, item) =>
                acc + Number(item.nota),
            0
            ) / totalAvaliacoes
        ).toFixed(1)
        : "0.0";

    const qtd5 = avaliacoes.filter(
    a => Number(a.nota) === 5
    ).length;

    const qtd4 = avaliacoes.filter(
    a => Number(a.nota) === 4
    ).length;

    const qtd3 = avaliacoes.filter(
    a => Number(a.nota) === 3
    ).length;

    const qtd2 = avaliacoes.filter(
    a => Number(a.nota) === 2
    ).length;

    const qtd1 = avaliacoes.filter(
    a => Number(a.nota) === 1
    ).length;

    useEffect(() => {

    const carregarAvaliacoes = async () => {
        if (!idPrestadorAvaliacoes) {
            if (status !== "loading") {
                setLoading(false);
            }
            return;
        }

        try {
        setLoading(true);
        setErroCarregamento("");

        const response = await fetch(
            `/api/avaliacoes/prestador/${idPrestadorAvaliacoes}`,
            { cache: "no-store" }
        );

        if (!response.ok) {
            const dadosErro = await response.json().catch(() => ({}));
            throw new Error(
            dadosErro.error || `Erro ao carregar avaliações: ${response.status}`
            );
        }

        const data = await response.json();

        setAvaliacoes(Array.isArray(data) ? data : []);
        setLoading(false);

        } catch (error) {

        console.error("Erro ao carregar avaliações.");
        setAvaliacoes([]);
        setErroCarregamento(
            "Não foi possível carregar as avaliações."
        );
        setLoading(false);

        }

    };

    carregarAvaliacoes();

    }, [idPrestadorAvaliacoes, status]);

    
    const percentual5 =
    totalAvaliacoes > 0
        ? (qtd5 / totalAvaliacoes) * 100
        : 0;
    const percentual4 =
    totalAvaliacoes > 0
        ? (qtd4 / totalAvaliacoes) * 100
        : 0;
    const percentual3 =
    totalAvaliacoes > 0
        ? (qtd3 / totalAvaliacoes) * 100
        : 0;
    const percentual2 =
    totalAvaliacoes > 0
        ? (qtd2 / totalAvaliacoes) * 100
        : 0;
    const percentual1 =
    totalAvaliacoes > 0
        ? (qtd1 / totalAvaliacoes) * 100
        : 0;


    const avaliacoesUltimos30Dias = avaliacoes.filter((avaliacao) => {
    const dataAvaliacao = new Date(avaliacao.data_avaliacao);

    const limite = new Date();
    limite.setDate(limite.getDate() - 30);

    return dataAvaliacao >= limite;
    }).length;

    const clientesAvaliados = new Set(
    avaliacoes
        .map((avaliacao) => Number(avaliacao.id_usuario))
        .filter((id) => !Number.isNaN(id))
    ).size;

    const criterios = [
    {
        key: "comunicacao",
        label: "Custo benefício",
        icon: CircleDollarSign,
    },
    {
        key: "respeito",
        label: "Atendimento",
        icon: BadgeCheck,
    },
    {
        key: "pontualidade",
        label: "Pontualidade",
        icon: Clock3,
    },
    {
        key: "acordo",
        label: "Qualidade do serviço",
        icon: Sparkles,
    },
    ];

    const obterValorCriterio = (avaliacao: any, criterio: { key: string }) => {
    const aliases: Record<string, string[]> = {
        comunicacao: ["comunicacao", "custo_beneficio"],
        respeito: ["respeito", "atendimento"],
        pontualidade: ["pontualidade"],
        acordo: ["acordo", "qualidade_servico"],
    };

    const candidatos = aliases[criterio.key] ?? [criterio.key];

    for (const chave of candidatos) {
        const valor = Number(avaliacao[chave]);
        if (!Number.isNaN(valor)) {
        return valor;
        }
    }

    return 0;
    };

    const mediasCriterios = criterios.reduce((acc, criterio) => {
    const valores = avaliacoes
        .map((avaliacao) => obterValorCriterio(avaliacao, criterio))
        .filter((valor) => !Number.isNaN(valor));

    acc[criterio.key] = valores.length > 0
        ? valores.reduce((soma, valor) => soma + valor, 0) / valores.length
        : 0;

    return acc;
    }, {} as Record<string, number>);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F8]">
        <div className="border-b border-[#CDCDCD] shrink-0 bg-white">
            <SearchBar />
        </div>
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
        <div className="flex flex-wrap gap-4 mb-8 items-end">

            {/* Nota geral */}
            <div className="bg-white border border-[#E2D5D5] rounded-2xl p-6 w-[220px] shadow-sm">

            <h3 className="font-semibold">
                Nota média geral
            </h3>

            <div className="text-center mt-4">
                <span className="text-5xl font-bold">
                {notaMedia}
                </span>
            </div>

            <div className="text-center text-yellow-400 text-2xl mt-3">
                ★★★★★
            </div>

            <p className="text-xs text-center text-gray-400 mt-3">
                Baseado em {totalAvaliacoes} avaliações
            </p>

            </div>

            {/* Cards estrelas */}
            <div className="flex gap-2 flex-wrap flex-1 items-stretch">

            <div className="bg-white border border-[#E2D5D5] rounded-2xl p-3 w-[140px] h-[165px] shadow-sm flex flex-col justify-between">
                <p className="font-medium">⭐ 5 estrelas</p>

                <p className="text-2xl font-semibold text-center mt-3">
                {qtd5}
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
                <div className=" h-2 bg-blue-500 rounded-full"
                style={{
                width: `${percentual5}%`
                }}
                ></div>
                </div>

                <p className="text-xs text-right text-gray-400 mt-2">
                {percentual5.toFixed(1)}%
                </p>
            </div>

            <div className="bg-white border border-[#E2D5D5] rounded-2xl p-3 w-[140px] h-[165px] shadow-sm flex flex-col justify-between">
                <p className="font-medium">⭐ 4 estrelas</p>

                <p className="text-2xl font-semibold text-center mt-3">
                {qtd4}
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
                <div className=" h-2 bg-blue-500 rounded-full"style={{
                width: `${percentual4}%`
                }}></div>
                </div>

                <p className="text-xs text-right text-gray-400  mt-2">
                {percentual4.toFixed(1)}%
                </p>
            </div>

            <div className="bg-white border border-[#E2D5D5] rounded-2xl p-3 w-[140px] h-[165px] shadow-sm flex flex-col justify-between">
                <p className="font-medium">⭐ 3 estrelas</p>

                <p className="text-2xl font-semibold text-center mt-3">
                {qtd3}
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
                <div className=" h-2 bg-blue-500 rounded-full"style={{
                width: `${percentual3}%`
                }}></div>
                </div>

                <p className="text-xs text-right text-gray-400 mt-2">
                {percentual3.toFixed(1)}%
                </p>
            </div>

            <div className="bg-white border border-[#E2D5D5] rounded-2xl p-3 w-[140px] h-[165px] shadow-sm flex flex-col justify-between">
                <p className="font-medium">⭐ 2 estrelas</p>

                <p className="text-2xl font-semibold text-center mt-3">
                {qtd2}
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
                <div className=" h-2 bg-blue-500 rounded-full"style={{
                width: `${percentual2}%`
                }}></div>
                </div>

                <p className="text-xs text-right text-gray-400 mt-2">
                {percentual2.toFixed(1)}%
                </p>
            </div>

            <div className="bg-white border border-[#E2D5D5] rounded-2xl p-3 w-[140px] h-[165px] shadow-sm flex flex-col justify-between">
                <p className="font-medium">⭐ 1 estrela</p>

                <p className="text-2xl font-semibold text-center mt-3">
                {qtd1}
                </p>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
                <div className=" h-2 bg-blue-500 rounded-full"style={{
                width: `${percentual1}%`
                }}></div>
                </div>

                <p className="text-xs text-right text-gray-400 mt-2">
                {percentual1.toFixed(1)}%
                </p>
            </div>

            </div>
        </div>

        {/* Conteúdo */}
        <div className="flex flex-col xl:flex-row gap-6">

            {/* Lista avaliações */}
            <div className="flex-1">

            

            {/* Filtros */}
            <div className="flex flex-wrap items-end gap-4 sm:gap-8 border-b mb-6">

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
                Todas ({totalAvaliacoes})
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
                5 estrelas ({qtd5})
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
                4 estrelas ({qtd4})
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
                3 estrelas ({qtd3})
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
                2 estrelas ({qtd2})

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
                1 estrelas ({qtd1})
                </button>

                

            </div>
            <p className="text-2xl font-bold text-gray-500 mb-3 ">
                {ordem === "recentes" ? "Mais recentes" : "Mais antigos"}
            </p>
            {/* Avaliação */}
            {loading && (
            <div className="bg-white border border-[#E2D5D5] rounded-2xl p-6 text-gray-500 shadow-sm">
                Carregando avaliações...
            </div>
            )}

            {!loading && erroCarregamento && (
            <div className="bg-white border border-red-100 rounded-2xl p-6 text-red-600 shadow-sm">
                {erroCarregamento}
            </div>
            )}

            {!loading && !erroCarregamento && avaliacoesFiltradas.length === 0 && (
            <div className="bg-white border border-[#E2D5D5] rounded-2xl p-6 text-gray-500 shadow-sm">
                Nenhuma avaliação encontrada.
            </div>
            )}

            {!loading && !erroCarregamento && avaliacoesFiltradas.map((avaliacao) => (
            <div
                key={avaliacao.id_avaliacao}
                className="
                bg-white
                border border-[#E2D5D5]
                rounded-2xl
                p-4
                mb-3
                relative
                shadow-sm
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

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">

                {/* Foto */}
                <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0 overflow-hidden ring-2 ring-gray-100">
                    {avaliacao.foto_perfil && (
                    <img
                        src={avaliacao.foto_perfil}
                        alt={avaliacao.nome}
                        className="w-full h-full object-cover"
                    />
                    )}
                </div>

                {/* Dados cliente */}
                <div className="w-full sm:w-[170px] shrink-0">

                    <h3 className="font-bold text-xl">
                    {avaliacao.nome}
                    </h3>

                    <p className="text-sm text-gray-400">
                    {new Date(
                    avaliacao.data_avaliacao
                    ).toLocaleDateString("pt-BR")}
                    </p>

                    <p className="mt-1 text-sm text-gray-600 break-words">
                    <span className="font-medium text-gray-700">Serviço:</span>{" "}
                    {avaliacao.titulo || avaliacao.categoria_servico || avaliacao.descricao_servico || avaliacao.nome_servico || avaliacao.servico || "Tipo de serviço avaliado"}
                    </p>

                </div>

                {/* Conteúdo avaliação */}
                <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-2">

                    <div className="text-yellow-400 text-lg">
                        {"★".repeat(Math.floor(Number(avaliacao.nota)))}
                    </div>

                    <span className="text-gray-800">
                        {avaliacao.nota}
                    </span>

                    </div>

                    <p className="mt-2 text-gray-800">
                    "{avaliacao.comentario}"
                    </p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {criterios.map((criterio) => {
                        const notaExibida = obterValorCriterio(avaliacao, criterio);

                        return (
                        <div
                            key={criterio.key}
                            className="bg-gray-50 rounded-lg px-3 py-2 flex items-start gap-2"
                        >
                            <div className="text-blue-600 mt-0.5">
                            <criterio.icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                            <p className="text-[11px] text-gray-500 mb-1">
                                {criterio.label}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-yellow-400">
                                {"★".repeat(Math.round(notaExibida))}
                            </div>
                            </div>
                        </div>
                        );
                    })}
                    </div>

                </div>

                </div>
            </div>
            ))}

            </div>

            {/* Sidebar */}
            <aside className="w-full xl:w-[280px] self-start xl:sticky xl:top-4">
                <div className="flex items-center justify-end gap-2 mb-4 px-1">
                    <span className="text-sm text-gray-500">
                    {textoOrdem}
                    </span>
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
            w-full
            xl:w-[250px]
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
                {avaliacoesUltimos30Dias}
                </span>
            </div>

            <div className="border-t border-[#EAEAEA] p-5 flex justify-between items-center">
                <p className="text-gray-400 text-sm font-medium">
                Clientes avaliados
                </p>

                <span className="text-4xl font-bold">
                {clientesAvaliados}
                </span>
            </div>

            <div className="border-t border-[#EAEAEA] p-5">
                <p className="text-gray-400 text-sm font-medium mb-3">
                Média por critério
                </p>

                <div className="space-y-2">
                {criterios.map((criterio) => (
                    <div
                    key={criterio.key}
                    className="flex items-center justify-between text-sm"
                    >
                    <div className="flex items-center gap-2 text-gray-600">
                        <criterio.icon className="w-4 h-4 text-blue-600" />
                        <span>
                        {criterio.label}
                        </span>
                    </div>
                    <span className="font-semibold text-gray-800">
                        {mediasCriterios[criterio.key].toFixed(1)}
                    </span>
                    </div>
                ))}
                </div>
            </div>
            </div>

            </aside>

        </div>
        </div>
    </div>
  );
}