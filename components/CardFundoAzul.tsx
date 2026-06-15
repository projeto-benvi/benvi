import { Search, MapPin } from "lucide-react";
import Image from "next/image";

export default function CardFundoAzul() {
  return (
    <section
      className="w-full rounded-3xl px-8 py-10 md:px-14 md:py-14 relative overflow-hidden flex items-center justify-between min-h-[340px]"
      style={{
        background: "linear-gradient(135deg, #A0C4FF 0%, #C4F1BE 100%)",
      }}
    >
      {/* Lado Esquerdo: Textos e Barra de Pesquisa */}
      <div className="z-10 w-full md:w-[60%] lg:w-[55%] flex flex-col justify-center">
        <h1 className="mb-4 text-3xl md:text-4xl font-extrabold leading-tight text-[#1E293B]">
          Encontre o profissional <br />
          ideal para o que <br />
          você precisa
        </h1>

        <p className="mb-10 max-w-[460px] text-sm md:text-base font-medium text-[#475569]">
          Conectamos você com profissionais confiáveis e avaliados pela comunidade
        </p>

        {/* Barra de Pesquisa Ampliada */}
        <div className="flex w-full items-center rounded-2xl bg-white p-2.5 shadow-lg border border-gray-100 transition-all">
          <div className="flex flex-1 items-center gap-3 px-3">
            <Search size={22} className="text-gray-400" />
            <input
              type="text"
              placeholder="O que você precisa? Ex: Eletricista, Encanador"
              className="w-full text-sm text-gray-700 outline-none placeholder:text-gray-400 font-medium"
            />
          </div>

          <div className="hidden h-8 w-px bg-gray-200 md:block" />

          <div className="hidden flex-1 items-center gap-3 px-3 md:flex">
            <MapPin size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Sua localização"
              className="w-full text-sm text-gray-700 outline-none placeholder:text-gray-400 font-medium"
            />
          </div>

          <button
            type="button"
            className="rounded-xl px-10 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95 shadow-md flex-shrink-0"
            style={{ backgroundColor: "#2563EB" }}
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Lado Direito: ILUSTRAÇÃO AMPLIADA */}
      <div className="hidden md:block absolute right-6 bottom-0 top-0 w-[35%] lg:w-[38%] max-w-[450px]">
        <Image
          src="/ilustracaoFerramenta.png"
          alt="Ilustração de profissional com ferramenta"
          fill
          priority
          className="object-contain object-bottom" // Alinha a base da imagem ao fundo do card como no protótipo
        />
      </div>
    </section>
  );
}