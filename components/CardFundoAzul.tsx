import { Search, MapPin } from "lucide-react";

export default function CardFundoAzul() {
  return (
    <section
      className="w-full rounded-2xl px-12 py-10"
      style={{
        background: "linear-gradient(135deg, #2563EB 0%, #69C771 100%)",
      }}
    >
      <div className="max-w-[720px]">
        <h1 className="mb-4 text-4xl font-bold leading-tight text-[#1F2937]">
          Encontre o profissional <br />
          ideal para o que <br />
          você precisa
        </h1>

        <p className="mb-8 max-w-[420px] text-sm text-[#1F2937]">
          Conectamos você com profissionais confiáveis e avaliados pela comunidade
        </p>

        <div className="flex w-full max-w-[720px] items-center rounded-xl bg-white p-2 shadow-md">
          <div className="flex flex-1 items-center gap-3 px-3">
            <Search size={22} className="text-gray-400" />
            <input
              type="text"
              placeholder="O que você precisa? Ex: Eletricista, Encanador"
              className="w-full text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="hidden h-8 w-px bg-gray-200 md:block" />

          <div className="hidden flex-1 items-center gap-3 px-3 md:flex">
            <MapPin size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Sua localização"
              className="w-full text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>

          <button
            type="button"
            className="rounded-xl px-8 py-3 text-sm font-bold text-white transition hover:opacity-90"
            style={{ backgroundColor: "#2563EB" }}
          >
            Buscar
          </button>
        </div>
      </div>
    </section>
  );
}