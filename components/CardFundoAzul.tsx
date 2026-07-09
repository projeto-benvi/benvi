"use client";

import { FormEvent, useState } from "react";
import { Search, MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CardFundoAzul() {
  const router = useRouter();
  const [servico, setServico] = useState("");
  const [localizacao, setLocalizacao] = useState("");

  function handleBuscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    const termoBusca = servico.trim();
    const termoLocalizacao = localizacao.trim();

    if (termoBusca) params.set("search", termoBusca);
    if (termoLocalizacao) params.set("location", termoLocalizacao);

    const query = params.toString();
    router.push(query ? `/buscar-servicos?${query}` : "/buscar-servicos");
  }

  return (
    <section
      className="w-full rounded-3xl px-6 py-8 md:px-14 md:py-14 relative overflow-hidden flex items-center min-h-[340px]"
      style={{
        background: "linear-gradient(135deg, #A0C4FF 0%, #C4F1BE 100%)",
      }}
    >
      {/* Lado Esquerdo: Textos e Barra de Pesquisa */}
      <div className="z-10 w-full md:w-[60%] lg:w-[55%] flex flex-col justify-center">
        <h1 className="mb-4 text-2xl md:text-4xl font-extrabold leading-tight text-[#1E293B]">
          Encontre o profissional <br className="hidden md:block" />
          ideal para o que você precisa
        </h1>

        <p className="mb-8 max-w-[460px] text-sm md:text-base font-medium text-[#475569]">
          Conectamos você com profissionais confiáveis e avaliados pela comunidade
        </p>

        {/* Barra de Pesquisa Ajustada */}
        <form 
          onSubmit={handleBuscar} 
          className="flex flex-col gap-2 md:flex-row w-full items-center rounded-2xl bg-white p-2 shadow-lg border border-gray-100"
        >
          {/* Campo Serviço */}
          <div className="flex w-full md:flex-1 items-center gap-3 px-3 py-1">
            <Search size={22} className="text-gray-400" />
            <input
              type="text"
              value={servico}
              onChange={(e) => setServico(e.target.value)}
              placeholder="O que você precisa?"
              className="w-full text-sm text-gray-700 outline-none placeholder:text-gray-400 font-medium"
            />
          </div>

          <div className="hidden h-8 w-px bg-gray-200 md:block" />

          {/* Campo Localização - Agora visível no celular */}
          <div className="flex w-full md:flex-1 items-center gap-3 px-3 py-1 border-t md:border-t-0 border-gray-100 pt-2 md:pt-0">
            <MapPin size={20} className="text-gray-400" />
            <input
              type="text"
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
              placeholder="Sua localização"
              className="w-full text-sm text-gray-700 outline-none placeholder:text-gray-400 font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto rounded-xl px-8 py-3 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95 shadow-md flex-shrink-0"
            style={{ backgroundColor: "#2563EB" }}
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Lado Direito: ILUSTRAÇÃO (Escondida em telas menores para não poluir) */}
      <div className="hidden lg:block absolute right-6 bottom-0 top-0 w-[38%] max-w-[450px]">
        <Image
          src="/ilustracaoFerramenta.png"
          alt="Ilustração de profissional com ferramenta"
          fill
          priority
          className="object-contain object-bottom"
        />
      </div>
    </section>
  );
}