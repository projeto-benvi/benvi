"use client";

import Image from "next/image";
import logo from "@/assets/logo Benvi1.png";
import iconCadeado from "@/assets/icons/iconCadeado.svg";
import iconCarta from "@/assets/icons/iconCarta.svg";
import iconCpf from "@/assets/icons/iconCpf.svg";
import iconPessoa from "@/assets/icons/iconPessoa.svg";
import iconTelefone from "@/assets/icons/iconTelefone.svg";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleCadastrar() {
    setErro("");
    setCarregando(true);
    try {
      const res = await fetch("/api/usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, cpf, telefone, senha, data_nascimento: dataNascimento }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro ?? "Erro ao cadastrar usuário.");
        return;
      }

    
      router.push("/");
    } catch (e) {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="bg-gradient-to-b from-blue-500 to-green-500 h-screen">
      <main className="min-h-screen bg-gradient-to-b from-blue-500 to-green-500 flex items-center justify-center">
        <div className="bg-white dark:bg-black p-10 rounded-2xl shadow-lg w-full max-w-md text-center flex flex-col items-center gap-2">
          <Image className="dark:invert" src={logo} alt="Logo da benvi" width={200} height={50} priority />
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Crie sua conta
          </h1>
          <p className="max-w-md font-bold text-sm leading-8 text-zinc-600 dark:text-zinc-400">
            Comece criando sua conta
          </p>

          <div className="relative w-full">
            <Image src={iconPessoa} alt="icone pessoa" width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={nome} onChange={e => setNome(e.target.value)} type="text" placeholder="Seu nome completo" className="border border-gray-300 rounded-md px-4 py-2 w-full pl-10" />
          </div>

          <div className="relative w-full">
            <Image src={iconCarta} alt="icone email" width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="seuemail@gmail.com" className="border border-gray-300 rounded-md px-4 py-2 w-full pl-10" />
          </div>

          <div className="relative w-full">
            <Image src={iconCpf} alt="icone cpf" width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={cpf} onChange={e => setCpf(e.target.value)} type="text" placeholder="CPF: 000.000.000-00" className="border border-gray-300 rounded-md px-4 py-2 w-full pl-10" />
          </div>

          <div className="relative w-full">
           <Image src={iconCpf} alt="icone data" width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} type="date" className="border border-gray-300 rounded-md px-4 py-2 w-full pl-10"
  />
</div>

          <div className="relative w-full">
            <Image src={iconTelefone} alt="icone telefone" width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={telefone} onChange={e => setTelefone(e.target.value)} type="text" placeholder="(00)0000-0000" className="border border-gray-300 rounded-md px-4 py-2 w-full pl-10" />
          </div>

          <div className="relative w-full">
            <Image src={iconCadeado} alt="icone senha" width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={senha} onChange={e => setSenha(e.target.value)} type="password" placeholder="Senha segura" className="border border-gray-300 rounded-md px-4 py-2 w-full pl-10" />
          </div>

          {erro && <p className="text-red-500 text-sm w-full text-left">{erro}</p>}

          <button
            onClick={handleCadastrar}
            disabled={carregando}
            className="rounded-md px-4 py-2 w-full bg-orange-400 text-white hover:bg-orange-500 transition text-xl disabled:opacity-60"
          >
            {carregando ? "Cadastrando..." : "Cadastrar"}
          </button>

          <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            Já tem sua conta?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">Entrar</Link>
          </p>
          <p className="max-w-md text-sm leading-8 text-zinc-600 dark:text-zinc-400">
            Política de privacidade -{" "}
            <Link href="/termosPrivacidade" className="text-blue-500 hover:underline">Termos</Link>
          </p>
          <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">© 2026 Benvi</p>
        </div>
      </main>
    </div>
  );
}