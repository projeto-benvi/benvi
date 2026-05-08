import Image from "next/image";
import logoBenvi from "../../assets/logo Benvi1.png";

import {
  FaBriefcase,
  FaGlobe,
  FaMapMarkerAlt,
  FaClock,
  FaStar,
} from "react-icons/fa";

export default function CadastroPrestador() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #2563EB 0%, #69C771 100%)",
      }}
    >
      <section className="w-[380px] rounded-3xl bg-white px-8 py-7 shadow-2xl">
        
        <div className="mb-5 flex justify-center">
          <Image
            src={logoBenvi}
            alt="Logo Benvi"
            width={150}
            priority
          />
        </div>

        <h1 className="mb-5 text-center text-2xl font-bold text-[#1F2937]">
          Crie sua conta
        </h1>

        <p className="mb-3 text-xs font-semibold text-[#1F2937]">
          Dados Complementares:
        </p>

        <form className="space-y-4">

          <div className="flex items-center rounded-xl bg-[#EEEEEE] px-4 py-3">
            <FaBriefcase className="mr-3 text-[#2563EB]" />

            <input
              type="text"
              placeholder="Categoria de Serviço"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex items-center rounded-xl bg-[#EEEEEE] px-4 py-3">
            <FaGlobe className="mr-3 text-[#2563EB]" />

            <input
              type="text"
              placeholder="Portfólio"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex items-center rounded-xl bg-[#EEEEEE] px-4 py-3">
            <FaMapMarkerAlt className="mr-3 text-[#2563EB]" />

            <input
              type="text"
              placeholder="Raio de Atendimento"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex items-center rounded-xl bg-[#EEEEEE] px-4 py-3">
            <FaClock className="mr-3 text-[#2563EB]" />

            <input
              type="text"
              placeholder="Disponibilidade"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex items-center rounded-xl bg-[#EEEEEE] px-4 py-3">
            <FaStar className="mr-3 text-[#2563EB]" />

            <input
              type="text"
              placeholder="Especialidade Principal"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <button
            type="button"
            className="mt-3 w-full rounded-xl py-3 text-sm font-bold text-white transition hover:opacity-90"
            style={{
              backgroundColor: "#F97316",
            }}
          >
            Cadastrar
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] text-[#1F2937]">
          Quer contratar um serviço?{" "}
          <span className="cursor-pointer font-semibold text-[#2563EB]">
            Cadastre-se como Cliente
          </span>
        </p>

        <p className="mt-8 text-center text-[10px] text-[#1F2937] opacity-60">
          Política de Privacidade · Termos
          <br />
          © 2026 Benvi
        </p>
      </section>
    </main>
  );
}