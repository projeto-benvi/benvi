"use client";

import Image from "next/image";
import logoBenvi from "@/assets/logo Benvi1.png";
import { FaBriefcase, FaGlobe, FaMapMarkerAlt, FaClock, FaStar } from "react-icons/fa";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function CadastroPrestador() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id_usuario = searchParams.get("id");

  const [categoria, setCategoria] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [raioAtendimento, setRaioAtendimento] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleCadastrar() {
    setErro("");

    if (!id_usuario) {
      setErro("ID de usuário não encontrado. Volte e tente novamente.");
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch("/api/prestador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: Number(id_usuario),
          categoria_principal: categoria,
          descricao_profissional: portfolio,
          // raioAtendimento e disponibilidade não têm coluna no banco ainda,
          // mas ficam aqui para quando você expandir o modelo
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro ?? "Erro ao cadastrar prestador.");
        return;
      }

      router.push("/"); // redireciona para home após cadastro completo
    } catch (e) {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #2563EB 0%, #69C771 100%)" }}
    >
      <section className="w-[380px] rounded-3xl bg-white px-8 py-7 shadow-2xl">
        <div className="mb-5 flex justify-center">
          <Image src={logoBenvi} alt="Logo Benvi" width={150} priority />
        </div>

        <h1 className="mb-5 text-center text-2xl font-bold text-[#1F2937]">
          Crie sua conta
        </h1>

        <p className="mb-3 text-xs font-semibold text-[#1F2937]">
          Dados Complementares:
        </p>

        <div className="space-y-4">
          <div className="flex items-center rounded-xl bg-[#EEEEEE] px-4 py-3">
            <FaBriefcase className="mr-3 text-[#2563EB]" />
            <input value={categoria} onChange={e => setCategoria(e.target.value)} type="text" placeholder="Categoria de Serviço" className="w-full bg-transparent text-sm outline-none" />
          </div>

          <div className="flex items-center rounded-xl bg-[#EEEEEE] px-4 py-3">
            <FaGlobe className="mr-3 text-[#2563EB]" />
            <input value={portfolio} onChange={e => setPortfolio(e.target.value)} type="text" placeholder="Portfólio / Descrição" className="w-full bg-transparent text-sm outline-none" />
          </div>

          <div className="flex items-center rounded-xl bg-[#EEEEEE] px-4 py-3">
            <FaMapMarkerAlt className="mr-3 text-[#2563EB]" />
            <input value={raioAtendimento} onChange={e => setRaioAtendimento(e.target.value)} type="text" placeholder="Raio de Atendimento" className="w-full bg-transparent text-sm outline-none" />
          </div>

          <div className="flex items-center rounded-xl bg-[#EEEEEE] px-4 py-3">
            <FaClock className="mr-3 text-[#2563EB]" />
            <input value={disponibilidade} onChange={e => setDisponibilidade(e.target.value)} type="text" placeholder="Disponibilidade" className="w-full bg-transparent text-sm outline-none" />
          </div>

          <div className="flex items-center rounded-xl bg-[#EEEEEE] px-4 py-3">
            <FaStar className="mr-3 text-[#2563EB]" />
            <input value={especialidade} onChange={e => setEspecialidade(e.target.value)} type="text" placeholder="Especialidade Principal" className="w-full bg-transparent text-sm outline-none" />
          </div>

          {erro && <p className="text-red-500 text-sm">{erro}</p>}

          <button
            onClick={handleCadastrar}
            disabled={carregando}
            className="mt-3 w-full rounded-xl py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#F97316" }}
          >
            {carregando ? "Cadastrando..." : "Cadastrar"}
          </button>
        </div>

        <p className="mt-5 text-center text-[11px] text-[#1F2937]">
          Quer contratar um serviço?{" "}
          <span className="cursor-pointer font-semibold text-[#2563EB]">
            Cadastre-se como Cliente
          </span>
        </p>

        <p className="mt-8 text-center text-[10px] text-[#1F2937] opacity-60">
          Política de Privacidade · Termos
          <br />© 2026 Benvi
        </p>
      </section>
    </main>
  );
}