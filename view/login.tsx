"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import LogoBranca from "@/assets/logo-branca.png"; 
import carta from "@/assets/icons/carta.svg";
import cadeado from "@/assets/icons/cadeado.svg";
import googleicon from "@/assets/icons/googleicon.svg";
import ilustracao from "@/assets/ilustracao_login.png"; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  // Função para lidar com o login de Email + Senha (MySQL)
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const resultado = await signIn("credentials", {
      email,
      password,
      redirect: false, // Evita recargas brutas de página
    });

    if (resultado?.error) {
      setCarregando(false);
      setErro("E-mail ou senha incorretos.");
    } else {
      // Login com sucesso! Força a atualização do estado e vai para a home
      router.push("/");
      router.refresh();
    }
  }

  // Função para lidar com o login do Google
  async function handleGoogleLogin() {
    setErro("");
    // O NextAuth já cuida do redirecionamento completo aqui
    await signIn("google", { callbackUrl: "/" });
  }

  return (
    <section className="flex w-full min-h-[100dvh] bg-gradient-to-b from-[#60A5FA] to-[#22C55E]">
      
      {/* Lado Esquerdo: Logo Branca + Ilustração (Fixado em 55% da tela) */}
      <div className="hidden md:flex flex-col w-[55%] p-8 lg:p-12 relative justify-between min-h-[100dvh]">
        
        {/* Logo Branca alinhada ao topo esquerdo */}
        <div className="w-full flex justify-start items-center pl-6 pt-2">
          <Image 
            src={LogoBranca} 
            alt="Logo Benvi" 
            width={150} 
            height={50} 
            priority
          />
        </div>

        {/* Container da Ilustração (Grande e centralizado sem esmagar o form) */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[800px] aspect-square relative">
            <Image 
              src={ilustracao} 
              alt="Ilustração Benvi" 
              fill
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        {/* Espaçador inferior */}
        <div className="h-6 hidden lg:block"></div>
      </div>

      {/* Lado Direito: Painel do Formulário (Expandido e fixado em 45% da tela) */}
      <div className="w-full md:w-[45%] bg-white md:rounded-tl-[100px] flex flex-col justify-between px-5 py-6 sm:p-8 md:p-10 lg:p-14 min-h-[100dvh] shadow-2xl z-10">
        
        {/* Botão de Voltar discreto no topo */}
        <div className="flex items-center justify-start pt-2">
          <button 
            type="button"
            onClick={() => router.back()} 
            aria-label="Voltar para a página anterior"
            className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <span className="text-xl font-medium">&lt;</span>
          </button>
        </div>

        {/* Bloco Central: Títulos e Formulário */}
        <div className="w-full max-w-[420px] mx-auto my-auto">
          <div className="text-center mb-7 sm:mb-10">
            <h1 className="text-3xl sm:text-[34px] font-bold text-[#1E293B] mb-2 tracking-tight">
              Bem-vindo de volta
            </h1>
            <p className="text-gray-400 text-sm">
              Faça login para continuar
            </p>
          </div>

          {/* Formulário Conectado ao Estado */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            
            {/* Input Email */}
            <div className="relative">
              <Image
                src={carta}
                alt="Email"
                width={20}
                height={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
              />
              <input
                type="email"
                required
                disabled={carregando}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@gmail.com"
                aria-label="E-mail"
                autoComplete="email"
                className="bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-4 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-400 font-normal text-sm disabled:opacity-60"
              />
            </div>

            {/* Input Senha */}
            <div className="relative">
              <Image
                src={cadeado}
                alt="Senha"
                width={20}
                height={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
              />
              <input
                type="password"
                required
                disabled={carregando}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                aria-label="Senha"
                autoComplete="current-password"
                className="bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-4 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-400 font-normal text-sm disabled:opacity-60"
              />
            </div>

            {/* Esqueceu a senha */}
            <div className="text-right -mt-3">
              <Link href="/recuperar-senha" className="text-xs text-blue-600 hover:underline">
                Esqueceu a senha?
              </Link>
            </div>

            {/* Mensagem de Erro Dinâmica */}
            {erro && (
              <p role="alert" aria-live="polite" className="text-xs text-red-500 font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">
                {erro}
              </p>
            )}

            {/* Botão Entrar com Feedback Visual */}
            <button 
              type="submit" 
              disabled={carregando}
              className="bg-[#F97316] text-white font-semibold rounded-xl py-4 mt-2 cursor-pointer hover:bg-[#EA580C] transition-colors text-base shadow-md shadow-orange-500/10 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {carregando ? "Autenticando..." : "Entrar"}
            </button>

            {/* Divisor "ou" */}
            <div className="flex items-center gap-4 my-1">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-sm font-normal">ou</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Botão Google Conectado */}
            <button 
              type="button" 
              disabled={carregando}
              onClick={handleGoogleLogin}
              aria-label="Entrar com Google"
              className="bg-[#EFEFEF] text-gray-700 font-medium rounded-xl py-3.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Image src={googleicon} alt="Google" width={18} height={18} />
              Entrar com Google
            </button>
          </form>

          {/* Link para criar conta */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <span>É novo por aqui? </span>
            <Link href="/cadastro/usuario" className="text-[#3B82F6] font-semibold hover:underline">
              Criar uma conta
            </Link>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center text-[11px] text-gray-400 space-y-1 pb-2">
          <p className="hover:underline cursor-pointer">Política de Privacidade - Termos</p>
          <p>© 2026 Benvi</p>
        </div>

      </div>
    </section>
  );
}
