"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import LogoBranca from "@/assets/logo-branca.png";
import ilustracao from "@/assets/ilustracao_login.png";
import googleicon from "@/assets/icons/googleicon.svg";

import iconPessoa from "@/assets/icons/iconPessoa.svg";
import iconCarta from "@/assets/icons/iconCarta.svg";
import iconCpf from "@/assets/icons/iconCpf.svg";
import iconTelefone from "@/assets/icons/iconTelefone.svg";
import iconCadeado from "@/assets/icons/iconCadeado.svg";
import iconCalendario from "@/assets/icons/iconCalendario.svg";
import { formatarCPF, somenteDigitos, validarCPF } from "@/app/lib/cpf";

import {
  FaWrench,
  FaBriefcase,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

type CategoriaBanco = {
  id_categoria: number;
  nome_categoria: string;
  descricao?: string;
};

function mascaraTelefone(valor: string) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarIdade(dataNascimento: string) {
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade >= 18;
}

function validarSenha(senha: string) {
  return {
    tamanho: senha.length >= 8,
    maiuscula: /[A-Z]/.test(senha),
    numero: /[0-9]/.test(senha),
  };
}

export default function CadastroUnificado() {
  const router = useRouter();

  const [passo, setPasso] = useState<1 | 2>(1);
  const [tipoConta, setTipoConta] = useState<"cliente" | "prestador">(
    "cliente"
  );
  const [idUsuarioGerado, setIdUsuarioGerado] = useState<number | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const [categoria, setCategoria] = useState("");
  const [categoriasBanco, setCategoriasBanco] = useState<CategoriaBanco[]>([]);
  const [tagsSelecionadas, setTagsSelecionadas] = useState<number[]>([]);
  const [dropdownTagsAberto, setDropdownTagsAberto] = useState(false);
  const [carregandoCategorias, setCarregandoCategorias] = useState(false);
  const [descricao, setDescricao] = useState("");

  const [erros, setErros] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(false);

  const forcaSenha = validarSenha(senha);
  const forcaTotal = Object.values(forcaSenha).filter(Boolean).length;

  useEffect(() => {
    async function carregarCategorias() {
      setCarregandoCategorias(true);

      try {
        const res = await fetch("/api/categoria");
        const dados = await res.json();
        setCategoriasBanco(Array.isArray(dados) ? dados : []);
        if (!res.ok || !Array.isArray(dados) || dados.length === 0) {
          setErros((p) => ({ ...p, categoria: "Não foi possível carregar as categorias do banco." }));
        }
      } catch {
        setCategoriasBanco([]);
      } finally {
        setCarregandoCategorias(false);
      }
    }

    carregarCategorias();
  }, []);

  async function fazerLoginAutomatico() {
    const login = await signIn("credentials", {
      email: email.trim().toLowerCase(),

      // Se no seu NextAuth o campo for "senha", troque a linha abaixo por:
      // senha,
      password: senha,

      redirect: false,
    });

    if (login?.error) {
      setErros({
        geral:
          "Cadastro realizado, mas não foi possível fazer login automático. Faça login manualmente.",
      });
      return false;
    }

    return true;
  }

  function validarPasso1() {
    const novosErros: Record<string, string> = {};

    if (!nome.trim() || nome.trim().split(" ").length < 2) {
      novosErros.nome = "Informe seu nome completo (nome e sobrenome).";
    }

    if (!validarEmail(email)) {
      novosErros.email = "Informe um e-mail válido.";
    }

    if (!validarCPF(cpf)) {
      novosErros.cpf = "Informe um CPF válido.";
    }

    if (!dataNascimento) {
      novosErros.dataNascimento = "Informe sua data de nascimento.";
    } else if (!validarIdade(dataNascimento)) {
      novosErros.dataNascimento = "Você precisa ter pelo menos 18 anos.";
    }

    if (telefone.replace(/\D/g, "").length < 10) {
      novosErros.telefone = "Informe um telefone válido com DDD.";
    }

    if (!forcaSenha.tamanho || !forcaSenha.maiuscula || !forcaSenha.numero) {
      novosErros.senha = "A senha não atende aos requisitos mínimos.";
    }

    if (senha !== confirmarSenha) {
      novosErros.confirmarSenha = "As senhas não coincidem.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function validarPasso2() {
    const novosErros: Record<string, string> = {};

    if (!categoria) {
      novosErros.categoria = "Selecione uma categoria de serviço.";
    }

    if (!descricao.trim() || descricao.trim().length < 20) {
      novosErros.descricao =
        "Descreva seus serviços em pelo menos 20 caracteres.";
    }


    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handlePasso1(e: React.FormEvent) {
    e.preventDefault();

    if (!validarPasso1()) return;

    setCarregando(true);

    try {
      const res = await fetch("/api/usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          cpf: somenteDigitos(cpf),
          telefone: telefone.replace(/\D/g, ""),
          senha,
          data_nascimento: dataNascimento,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.campo) {
          setErros({
            [data.campo]: data.erro,
          });
        } else {
          setErros({
            geral: data.erro ?? "Erro ao criar usuário.",
          });
        }

        return;
      }

      if (tipoConta === "prestador") {
        setIdUsuarioGerado(data.id || data.id_usuario);
        setPasso(2);
        setErros({});
        return;
      }

      const logou = await fazerLoginAutomatico();

      if (!logou) return;

      router.push("/");
      router.refresh();
    } catch {
      setErros({
        geral: "Erro de conexão. Tente novamente.",
      });
    } finally {
      setCarregando(false);
    }
  }

  async function handlePasso2(e: React.FormEvent) {
    e.preventDefault();

    if (!validarPasso2()) return;

    if (!idUsuarioGerado) {
      setErros({
        geral: "ID de usuário não encontrado. Recomece o cadastro.",
      });
      return;
    }

    setCarregando(true);

    try {
      const logou = await fazerLoginAutomatico();

      if (!logou) return;

      const res = await fetch("/api/prestador", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: idUsuarioGerado,
          categoria_principal: categoria,
          descricao_profissional: descricao.trim(),
          id_categorias: tagsSelecionadas.filter((idCategoria) => {
            const categoriaPrincipal = categoriasBanco.find((cat) => cat.nome_categoria === categoria);
            return idCategoria !== categoriaPrincipal?.id_categoria;
          }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErros({
          geral: data.erro ?? "Erro ao cadastrar dados do prestador.",
        });
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setErros({
        geral: "Erro de conexão. Tente novamente.",
      });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="flex w-full min-h-[100dvh] bg-gradient-to-b from-[#60A5FA] to-[#22C55E]">
      <div className="hidden md:flex flex-col w-[55%] p-8 lg:p-12 relative justify-between min-h-[100dvh]">
        <div className="w-full flex justify-start items-center pl-6 pt-2">
          <Image
            src={LogoBranca}
            alt="Logo Benvi"
            width={150}
            height={50}
            priority
          />
        </div>

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

        <div className="h-6 hidden lg:block" />
      </div>

      <div className="w-full md:w-[45%] bg-white md:rounded-tl-[100px] flex flex-col justify-between px-4 py-6 sm:p-8 md:p-10 lg:p-12 min-h-[100dvh] shadow-2xl z-10">
        <div className="flex items-center justify-start pt-2 h-6">
          {passo === 1 ? (
            <Link
              href="/login"
              aria-label="Voltar para a página de login"
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-xl font-medium"
            >
              &lt;
            </Link>
          ) : (
            <button
              type="button"
              aria-label="Voltar para a etapa anterior"
              onClick={() => {
                setPasso(1);
                setErros({});
              }}
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-xl font-medium"
            >
              &lt; Voltar
            </button>
          )}
        </div>

        <div className="w-full max-w-[420px] mx-auto my-auto py-4">
          <div className="text-center mb-6">
            <h1 className="text-[34px] font-bold text-[#1E293B] mb-1 tracking-tight">
              Crie sua conta
            </h1>

            <p className="text-gray-400 text-sm">
              {passo === 1
                ? "Comece preenchendo seus dados básicos"
                : "Preencha suas informações de trabalho"}
            </p>

            {tipoConta === "prestador" && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <div
                  className={`h-1.5 w-12 rounded-full transition-colors ${
                    passo >= 1 ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
                <div
                  className={`h-1.5 w-12 rounded-full transition-colors ${
                    passo >= 2 ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
              </div>
            )}
          </div>

          {passo === 1 && (
            <form onSubmit={handlePasso1} className="flex flex-col gap-3" noValidate>
              <div className="grid grid-cols-2 gap-3 mb-1 w-full">
                {(["cliente", "prestador"] as const).map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setTipoConta(tipo)}
                    aria-label={`Selecionar tipo de conta ${tipo}`}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer capitalize ${
                      tipoConta === tipo
                        ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-md shadow-blue-500/10"
                        : "bg-[#EFEFEF] text-gray-500 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    Sou {tipo}
                  </button>
                ))}
              </div>

              <div>
                <div className="relative">
                  <Image
                    src={iconPessoa}
                    alt="Nome"
                    width={20}
                    height={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
                  />
                  <input
                    value={nome}
                    onChange={(e) => {
                      setNome(e.target.value);
                      setErros((p) => ({ ...p, nome: "" }));
                    }}
                    type="text"
                    placeholder="Seu nome completo"
                    aria-label="Nome completo"
                    aria-describedby={erros.nome ? 'erro-nome' : undefined}
                    autoComplete="name"
                    className={`bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-3.5 w-full focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-sm ${
                      erros.nome ? "ring-2 ring-red-400" : "focus:ring-orange-500"
                    }`}
                  />
                </div>
                {erros.nome && (
                  <p id="erro-nome" role="alert" className="text-red-500 text-xs mt-1 pl-1">{erros.nome}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Image
                    src={iconCarta}
                    alt="Email"
                    width={20}
                    height={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
                  />
                  <input
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErros((p) => ({ ...p, email: "" }));
                    }}
                    type="email"
                    placeholder="seuemail@gmail.com"
                    aria-label="E-mail"
                    aria-describedby={erros.email ? 'erro-email' : undefined}
                    autoComplete="email"
                    className={`bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-3.5 w-full focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-sm ${
                      erros.email ? "ring-2 ring-red-400" : "focus:ring-orange-500"
                    }`}
                  />
                </div>
                {erros.email && (
                  <p id="erro-email" role="alert" className="text-red-500 text-xs mt-1 pl-1">{erros.email}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Image
                    src={iconCpf}
                    alt="CPF"
                    width={20}
                    height={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
                  />
                  <input
                    value={cpf}
                    onChange={(e) => {
                      setCpf(formatarCPF(e.target.value));
                      setErros((p) => ({ ...p, cpf: "" }));
                    }}
                    type="text"
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    aria-label="CPF"
                    aria-describedby={erros.cpf ? 'erro-cpf' : undefined}
                    className={`bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-3.5 w-full focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-sm ${
                      erros.cpf ? "ring-2 ring-red-400" : "focus:ring-orange-500"
                    }`}
                  />
                </div>
                {erros.cpf && (
                  <p id="erro-cpf" role="alert" className="text-red-500 text-xs mt-1 pl-1">{erros.cpf}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Image
                    src={iconCalendario}
                    alt="Nascimento"
                    width={20}
                    height={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
                  />
                  <input
                    value={dataNascimento}
                    onChange={(e) => {
                      setDataNascimento(e.target.value);
                      setErros((p) => ({ ...p, dataNascimento: "" }));
                    }}
                    type="date"
                    aria-label="Data de nascimento"
                    aria-describedby={erros.dataNascimento ? 'erro-dataNascimento' : undefined}
                    autoComplete="bday"
                    className={`bg-[#EFEFEF] rounded-xl pl-12 pr-4 py-3.5 w-full focus:outline-none focus:ring-2 transition-all text-sm text-gray-500 ${
                      erros.dataNascimento
                        ? "ring-2 ring-red-400"
                        : "focus:ring-orange-500"
                    }`}
                  />
                </div>
                {erros.dataNascimento && (
                  <p id="erro-dataNascimento" role="alert" className="text-red-500 text-xs mt-1 pl-1">
                    {erros.dataNascimento}
                  </p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Image
                    src={iconTelefone}
                    alt="Telefone"
                    width={20}
                    height={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
                  />
                  <input
                    value={telefone}
                    onChange={(e) => {
                      setTelefone(mascaraTelefone(e.target.value));
                      setErros((p) => ({ ...p, telefone: "" }));
                    }}
                    type="text"
                    placeholder="(00) 00000-0000"
                    inputMode="numeric"
                    aria-label="Telefone"
                    aria-describedby={erros.telefone ? 'erro-telefone' : undefined}
                    autoComplete="tel"
                    className={`bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-3.5 w-full focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-sm ${
                      erros.telefone
                        ? "ring-2 ring-red-400"
                        : "focus:ring-orange-500"
                    }`}
                  />
                </div>
                {erros.telefone && (
                  <p id="erro-telefone" role="alert" className="text-red-500 text-xs mt-1 pl-1">
                    {erros.telefone}
                  </p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Image
                    src={iconCadeado}
                    alt="Senha"
                    width={20}
                    height={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
                  />
                  <input
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      setErros((p) => ({ ...p, senha: "" }));
                    }}
                    type={verSenha ? "text" : "password"}
                    placeholder="Senha segura"
                    aria-label="Senha"
                    aria-describedby={erros.senha ? 'erro-senha' : 'ajuda-senha'}
                    autoComplete="new-password"
                    className={`bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-10 py-3.5 w-full focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-sm ${
                      erros.senha ? "ring-2 ring-red-400" : "focus:ring-orange-500"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setVerSenha(!verSenha)}
                    aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {verSenha ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>

                {senha.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            forcaTotal >= n
                              ? forcaTotal === 1
                                ? "bg-red-400"
                                : forcaTotal === 2
                                  ? "bg-yellow-400"
                                  : "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    <div id="ajuda-senha" className="flex flex-col gap-0.5 pl-0.5">
                      {[
                        {
                          ok: forcaSenha.tamanho,
                          label: "Mínimo 8 caracteres",
                        },
                        {
                          ok: forcaSenha.maiuscula,
                          label: "Uma letra maiúscula",
                        },
                        {
                          ok: forcaSenha.numero,
                          label: "Um número",
                        },
                      ].map(({ ok, label }) => (
                        <p
                          key={label}
                          className={`text-[10px] font-medium ${
                            ok ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {ok ? "✓" : "·"} {label}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {erros.senha && (
                  <p id="erro-senha" role="alert" className="text-red-500 text-xs mt-1 pl-1">{erros.senha}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Image
                    src={iconCadeado}
                    alt="Confirmar senha"
                    width={20}
                    height={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
                  />
                  <input
                    value={confirmarSenha}
                    onChange={(e) => {
                      setConfirmarSenha(e.target.value);
                      setErros((p) => ({ ...p, confirmarSenha: "" }));
                    }}
                    type={verConfirmar ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    aria-label="Confirmar senha"
                    aria-describedby={erros.confirmarSenha ? 'erro-confirmarSenha' : undefined}
                    autoComplete="new-password"
                    className={`bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-10 py-3.5 w-full focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-sm ${
                      erros.confirmarSenha
                        ? "ring-2 ring-red-400"
                        : "focus:ring-orange-500"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setVerConfirmar(!verConfirmar)}
                    aria-label={verConfirmar ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {verConfirmar ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>

                {erros.confirmarSenha && (
                  <p id="erro-confirmarSenha" role="alert" className="text-red-500 text-xs mt-1 pl-1">
                    {erros.confirmarSenha}
                  </p>
                )}
              </div>

              {erros.geral && (
                <p role="alert" aria-live="polite" className="text-red-500 text-xs font-semibold pl-1 text-center bg-red-50 py-2 rounded-lg">
                  {erros.geral}
                </p>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="bg-[#F97316] text-white font-semibold rounded-xl py-4 mt-1 cursor-pointer hover:bg-[#EA580C] transition-colors text-base shadow-md shadow-orange-500/10 disabled:opacity-60"
              >
                {carregando
                  ? "Processando..."
                  : tipoConta === "prestador"
                    ? "Próximo passo →"
                    : "Cadastrar"}
              </button>

              <div className="flex items-center gap-4 my-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-sm">ou</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                aria-label="Cadastrar com Google"
                className="bg-[#EFEFEF] text-gray-700 font-medium rounded-xl py-3.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors text-sm"
              >
                <Image src={googleicon} alt="Google" width={18} height={18} />
                Cadastrar com Google
              </button>
            </form>
          )}

          {passo === 2 && (
            <form onSubmit={handlePasso2} className="flex flex-col gap-3" noValidate>
              <div className="grid grid-cols-2 gap-3 mb-1 w-full opacity-50 pointer-events-none">
                <button
                  type="button"
                  className="py-3 rounded-xl text-sm font-semibold border bg-[#EFEFEF] text-gray-500 border-transparent"
                >
                  Sou cliente
                </button>
                <button
                  type="button"
                  className="py-3 rounded-xl text-sm font-semibold border bg-[#3B82F6] text-white border-[#3B82F6]"
                >
                  Sou prestador
                </button>
              </div>

              <div>
                <div className="relative">
                  <FaWrench
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={16}
                  />

                  <select
                    value={categoria}
                    onChange={(e) => {
                      setCategoria(e.target.value);
                      const categoriaEscolhida = categoriasBanco.find((cat) => cat.nome_categoria === e.target.value);
                      if (categoriaEscolhida) {
                        setTagsSelecionadas((tags) => tags.filter((id) => id !== categoriaEscolhida.id_categoria));
                      }
                      setErros((p) => ({ ...p, categoria: "" }));
                    }}
                    disabled={carregandoCategorias || categoriasBanco.length === 0}
                    aria-label="Categoria principal de serviço"
                    aria-describedby={erros.categoria ? 'erro-categoria' : undefined}
                    className={`bg-[#EFEFEF] text-gray-700 rounded-xl pl-12 pr-4 py-3.5 w-full focus:outline-none focus:ring-2 transition-all text-sm appearance-none cursor-pointer disabled:opacity-60 ${
                      erros.categoria
                        ? "ring-2 ring-red-400"
                        : "focus:ring-orange-500"
                    }`}
                  >
                    <option value="">
                      {carregandoCategorias ? "Carregando categorias..." : "Selecione sua categoria principal"}
                    </option>
                    {categoriasBanco.map((cat) => (
                      <option key={cat.id_categoria} value={cat.nome_categoria}>
                        {cat.nome_categoria}
                      </option>
                    ))}
                  </select>

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
                    ▼
                  </span>
                </div>

                {erros.categoria && (
                  <p id="erro-categoria" role="alert" className="text-red-500 text-xs mt-1 pl-1">
                    {erros.categoria}
                  </p>
                )}
              </div>

              <div className="relative rounded-xl bg-[#F7F7F7] p-4">
                <button
                  type="button"
                  onClick={() => setDropdownTagsAberto((aberto) => !aberto)}
                  aria-controls="dropdown-categorias-secundarias"
                  aria-label="Selecionar categorias secundárias"
                  className="flex w-full items-center justify-between text-left"
                >
                  <span>
                    <span className="block text-sm font-semibold text-gray-700">Categorias secundárias</span>
                    <span className="block text-xs text-gray-500 mt-1">
                      {tagsSelecionadas.length > 0
                        ? `${tagsSelecionadas.length} selecionada(s)`
                        : "Escolha outras áreas em que você também atende."}
                    </span>
                  </span>
                  <span className="text-xs text-gray-400">{dropdownTagsAberto ? "▲" : "▼"}</span>
                </button>

                {dropdownTagsAberto && (
                  <div id="dropdown-categorias-secundarias" className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                    {categoriasBanco.filter((cat) => cat.nome_categoria !== categoria).length === 0 ? (
                      <p className="px-3 py-2 text-xs text-gray-400">Nenhuma categoria disponível.</p>
                    ) : (
                      categoriasBanco
                        .filter((cat) => cat.nome_categoria !== categoria)
                        .map((cat) => {
                          const selecionada = tagsSelecionadas.includes(cat.id_categoria);

                          return (
                            <label
                              key={cat.id_categoria}
                              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50"
                            >
                              <input
                                type="checkbox"
                                aria-label={`Selecionar categoria secundária ${cat.nome_categoria}`}
                                checked={selecionada}
                                onChange={() => {
                                  setTagsSelecionadas((tags) =>
                                    selecionada
                                      ? tags.filter((id) => id !== cat.id_categoria)
                                      : [...tags, cat.id_categoria]
                                  );
                                }}
                                className="h-4 w-4 accent-blue-600"
                              />
                              <span>{cat.nome_categoria}</span>
                            </label>
                          );
                        })
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="relative">
                  <FaBriefcase className="absolute left-4 top-4 text-gray-400" size={16} />

                  <textarea
                    value={descricao}
                    onChange={(e) => {
                      setDescricao(e.target.value);
                      setErros((p) => ({ ...p, descricao: "" }));
                    }}
                    placeholder="Descreva seus serviços, experiência e diferenciais..."
                    rows={4}
                    aria-label="Descrição profissional"
                    aria-describedby={erros.descricao ? 'erro-descricao' : 'contador-descricao'}
                    className={`bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-3.5 w-full focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-sm resize-none ${
                      erros.descricao
                        ? "ring-2 ring-red-400"
                        : "focus:ring-orange-500"
                    }`}
                  />
                </div>

                <div className="flex justify-between items-center mt-1 pl-1">
                  {erros.descricao ? (
                    <p id="erro-descricao" role="alert" className="text-red-500 text-xs">{erros.descricao}</p>
                  ) : (
                    <span />
                  )}

                  <p
                    id="contador-descricao"
                    className={`text-xs ml-auto ${
                      descricao.length < 20 ? "text-gray-400" : "text-green-500"
                    }`}
                  >
                    {descricao.length}/20 mín.
                  </p>
                </div>
              </div>

              {erros.geral && (
                <p role="alert" aria-live="polite" className="text-red-500 text-xs font-semibold text-center bg-red-50 py-2 rounded-lg">
                  {erros.geral}
                </p>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="bg-[#F97316] text-white font-semibold rounded-xl py-4 mt-1 cursor-pointer hover:bg-[#EA580C] transition-colors text-base shadow-md shadow-orange-500/10 disabled:opacity-60"
              >
                {carregando ? "Cadastrando..." : "Finalizar cadastro"}
              </button>
            </form>
          )}

          <div className="text-center mt-5 text-sm text-gray-500">
            <span>Já tem sua conta? </span>
            <Link
              href="/login"
              className="text-[#3B82F6] font-semibold hover:underline"
            >
              Entrar
            </Link>
          </div>
        </div>

        <div className="text-center text-[11px] text-gray-400 space-y-1 pb-2 pt-4">
          <p className="hover:underline cursor-pointer">
            Política de Privacidade - Termos
          </p>
          <p>© 2026 Benvi</p>
        </div>
      </div>
    </section>
  );
}
