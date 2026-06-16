"use client";

import Image from "next/image";
<<<<<<< HEAD
=======
import logo from "@/assets/logo-Benvi1.png"
import iconCadeado from "@/assets/icons/iconCadeado.svg"
import iconCarta from "@/assets/icons/iconCarta.svg"
import iconCpf from "@/assets/icons/iconCpf.svg"
import iconPessoa from "@/assets/icons/iconPessoa.svg"
import iconTelefone from "@/assets/icons/iconTelefone.svg"
>>>>>>> 3f816a8 (tela de editar usuario sem atualização de codigo)
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Assets baseados no seu design de Login/Cadastro
import LogoBranca from "@/assets/logo-branca.png"; 
import ilustracao from "@/assets/ilustracao_login.png"; 
import googleicon from "@/assets/icons/googleicon.svg";

// Ícones dos Inputs (Passo 1)
import iconPessoa from "@/assets/icons/iconPessoa.svg";
import iconCarta from "@/assets/icons/iconCarta.svg";
import iconCpf from "@/assets/icons/iconCpf.svg";
import iconTelefone from "@/assets/icons/iconTelefone.svg";
import iconCadeado from "@/assets/icons/iconCadeado.svg";

// Ícones do React-Icons (Passo 2)
import { FaWrench, FaBriefcase, FaAward } from "react-icons/fa";

export default function CadastroUnificado() {
  const router = useRouter();

  // Controle de Fluxo e Tipo de Conta
  const [passo, setPasso] = useState<1 | 2>(1);
  const [tipoConta, setTipoConta] = useState<"cliente" | "prestador">("cliente");
  const [idUsuarioGerado, setIdUsuarioGerado] = useState<number | null>(null);

  // Dados do Passo 1 (Usuário)
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");

  // Dados do Passo 2 (Prestador)
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [especialidade, setEspecialidade] = useState("");

  // Estados de Interface
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Lógica do Passo 1: Cadastro do Usuário Base
  async function handlePasso1(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!nome || !email || !cpf || !dataNascimento || !telefone || !senha) {
      setErro("Por favor, preencha todos os campos.");
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch("/api/usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, cpf, telefone, senha, data_nascimento: dataNascimento }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro ?? "Erro ao criar usuário.");
        return;
      }

      if (tipoConta === "prestador") {
        setIdUsuarioGerado(data.id || data.id_usuario); 
        setPasso(2); 
      } else {
        router.push("/"); 
      }
    } catch (e) {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  // Lógica do Passo 2: Dados profissionais do Prestador
  async function handlePasso2(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!idUsuarioGerado) {
      setErro("ID de usuário não encontrado. Recomece o cadastro.");
      return;
    }

    if (!categoria || !descricao || !especialidade) {
      setErro("Por favor, preencha todos os campos profissionais.");
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch("/api/prestador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: idUsuarioGerado,
          categoria_principal: categoria,
          descricao_profissional: descricao, 
          especialidade_principal: especialidade
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro ?? "Erro ao cadastrar dados do prestador.");
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
    <section className="flex w-full h-screen bg-gradient-to-b from-[#60A5FA] to-[#22C55E] overflow-hidden">
      
      {/* Lado Esquerdo: Logo Branca + Ilustração (55% da tela) */}
      <div className="hidden md:flex flex-col w-[55%] p-12 relative justify-between h-full">
        <div className="w-full flex justify-start items-center pl-6 pt-2">
          <Image src={LogoBranca} alt="Logo Benvi" width={150} height={50} priority />
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[800px] aspect-square relative">
            <Image src={ilustracao} alt="Ilustração Benvi" fill className="object-contain" priority />
          </div>
        </div>
        
        <div className="h-6 hidden lg:block"></div>
      </div>

      {/* Lado Direito: Painel do Formulário Dinâmico (45% da tela) */}
      <div className="w-full md:w-[45%] bg-white rounded-tl-[60px] md:rounded-tl-[100px] flex flex-col justify-between p-8 md:p-12 h-full shadow-2xl z-10 overflow-y-auto custom-scrollbar">
        
        {/* Topo do Formulário: Botões de Voltar */}
        <div className="flex items-center justify-start pt-2 h-6">
          {passo === 1 ? (
          
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-xl font-medium"
            >
              &lt; 
            </Link>
          ) : (
            /* Botão para voltar para o Passo 1 do cadastro (Passo 2) */
            <button 
              onClick={() => setPasso(1)} 
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-xl font-medium"
            >
              &lt; Voltar
            </button>
          )}
        </div>

        {/* Bloco Central do Formulário */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-4">
          <div className="text-center mb-6">
            <h1 className="text-[34px] font-bold text-[#1E293B] mb-1 tracking-tight">
              Crie sua conta
            </h1>
            <p className="text-gray-400 text-sm">
              {passo === 1 ? "Comece preenchendo seus dados básicos" : "Preencha suas informações de trabalho"}
            </p>
          </div>

          {/* ==================== FORMULÁRIO DO PASSO 1 ==================== */}
          {passo === 1 && (
            <form onSubmit={handlePasso1} className="flex flex-col gap-4">
              
              {/* Botões seletores de Tipo de Conta */}
              <div className="grid grid-cols-2 gap-3 mb-2 w-full">
                <button
                  type="button"
                  onClick={() => setTipoConta("cliente")}
                  className={`py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                    tipoConta === "cliente" 
                      ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-md shadow-blue-500/10" 
                      : "bg-[#EFEFEF] text-gray-500 border-transparent hover:bg-gray-200"
                  }`}
                >
                  Sou cliente
                </button>
                <button
                  type="button"
                  onClick={() => setTipoConta("prestador")}
                  className={`py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                    tipoConta === "prestador" 
                      ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-md shadow-blue-500/10" 
                      : "bg-[#EFEFEF] text-gray-500 border-transparent hover:bg-gray-200"
                  }`}
                >
                  Sou prestador
                </button>
              </div>

              {/* Inputs Básicos */}
              <div className="relative">
                <Image src={iconPessoa} alt="Nome" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                <input value={nome} onChange={e => setNome(e.target.value)} type="text" placeholder="Seu nome completo" className="bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-3.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-400 text-sm" />
              </div>

              <div className="relative">
                <Image src={iconCarta} alt="Email" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="seuemail@gmail.com" className="bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-3.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-400 text-sm" />
              </div>

              <div className="relative">
                <Image src={iconCpf} alt="CPF" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                <input value={cpf} onChange={e => setCpf(e.target.value)} type="text" placeholder="CPF: 000.000.000-00" className="bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-3.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-400 text-sm" />
              </div>

              <div className="relative">
                <Image src={iconCpf} alt="Nascimento" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                <input value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} type="date" className="bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-3.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm text-gray-400" />
              </div>

              <div className="relative">
                <Image src={iconTelefone} alt="Telefone" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                <input value={telefone} onChange={e => setTelefone(e.target.value)} type="text" placeholder="(00) 00000-0000" className="bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-3.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-400 text-sm" />
              </div>

              <div className="relative">
                <Image src={iconCadeado} alt="Senha" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                <input value={senha} onChange={e => setSenha(e.target.value)} type="password" placeholder="Senha segura" className="bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-3.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-400 text-sm" />
              </div>

              {erro && <p className="text-red-500 text-xs font-semibold pl-1 text-left">{erro}</p>}

              <button 
                type="submit" 
                disabled={carregando}
                className="bg-[#F97316] text-white font-semibold rounded-xl py-4 mt-2 cursor-pointer hover:bg-[#EA580C] transition-colors text-base shadow-md shadow-orange-500/10 disabled:opacity-60"
              >
                {carregando ? "Processando..." : tipoConta === "prestador" ? "Próximo Passo" : "Cadastrar"}
              </button>

              <div className="flex items-center gap-4 my-1">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-gray-400 text-sm">ou</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <button type="button" className="bg-[#EFEFEF] text-gray-700 font-medium rounded-xl py-3.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors text-sm">
                <Image src={googleicon} alt="Google" width={18} height={18} />
                Cadastrar com Google
              </button>
            </form>
          )}

          {/* ==================== FORMULÁRIO DO PASSO 2 ==================== */}
          {passo === 2 && (
            <form onSubmit={handlePasso2} className="flex flex-col gap-4">
              
              {/* Botões seletores desativados no Passo 2 para consistência visual */}
              <div className="grid grid-cols-2 gap-3 mb-2 w-full opacity-60 pointer-events-none">
                <button type="button" className="py-3 rounded-xl text-sm font-semibold border bg-[#EFEFEF] text-gray-500 border-transparent">
                  Sou cliente
                </button>
                <button type="button" className="py-3 rounded-xl text-sm font-semibold border bg-[#3B82F6] text-white border-[#3B82F6]">
                  Sou prestador
                </button>
              </div>

              {/* Inputs Profissionais */}
              <div className="relative">
                <FaWrench className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input value={categoria} onChange={e => setCategoria(e.target.value)} type="text" placeholder="Categoria de Serviço:" className="bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-3.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-400 text-sm" required />
              </div>

              <div className="relative">
                <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input value={descricao} onChange={e => setDescricao(e.target.value)} type="text" placeholder="Descrição" className="bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-3.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-400 text-sm" required />
              </div>

              <div className="relative">
                <FaAward className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input value={especialidade} onChange={e => setEspecialidade(e.target.value)} type="text" placeholder="Especialidade Principal:" className="bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-3.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-400 text-sm" required />
              </div>

              {erro && <p className="text-red-500 text-xs font-semibold pl-1 text-left">{erro}</p>}

              <button 
                type="submit" 
                disabled={carregando}
                className="bg-[#F97316] text-white font-semibold rounded-xl py-4 mt-2 cursor-pointer hover:bg-[#EA580C] transition-colors text-base shadow-md shadow-orange-500/10 disabled:opacity-60"
              >
                {carregando ? "Cadastrando..." : "Cadastrar"}
              </button>
            </form>
          )}

          {/* Link para alternar para o Login */}
          <div className="text-center mt-6 text-sm text-gray-500">
            <span>Já tem sua conta? </span>
            <Link href="/login" className="text-[#3B82F6] font-semibold hover:underline">
              Entrar
            </Link>
          </div>
        </div>

        {/* Rodapé Fixo */}
        <div className="text-center text-[11px] text-gray-400 space-y-1 pb-2 pt-4">
          <p className="hover:underline cursor-pointer">Política de Privacidade - Termos</p>
          <p>© 2026 Benvi</p>
        </div>

      </div>
    </section>
  );
}