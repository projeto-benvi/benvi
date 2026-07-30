"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import SearchBar from "@/components/searchBar"; // Ajuste o caminho conforme o seu projeto
import { useAuth } from "@/hooks/useAuth";

type UsuarioApi = {
  id_usuario: number;
  nome: string;
  status_conta?: string;
};

type PrestadorApi = {
  id_usuario: number;
  impulsiona_perfil?: boolean;
  categoria_principal?: string;
};

type AssinaturaApi = {
  id_assinatura: number;
  valor_pago: number;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
  status_pagamento: string;
};

type MetodoPagamento = "pix" | "cartao" | "boleto";

const PIX_COPIA_COLA = "00020126580014BR.GOV.BCB.PIX0136benvi-impulsionar@pagamento.com520400005303986540529.905802BR5920BENVI SERVICOS LTDA6009SAOPAULO62070503***6304A1B2";

type ErrosPagamento = Record<string, string>;

function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

function formatarNumeroCartao(valor: string): string {
  const digitos = apenasDigitos(valor).slice(0, 16);
  return digitos.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatarValidade(valor: string): string {
  const digitos = apenasDigitos(valor).slice(0, 4);
  if (digitos.length <= 2) return digitos;
  return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
}

function formatarCVV(valor: string): string {
  return apenasDigitos(valor).slice(0, 4);
}

function formatarCPF(valor: string): string {
  const digitos = apenasDigitos(valor).slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function validarCPF(cpf: string): boolean {
  const digitos = apenasDigitos(cpf);
  if (digitos.length !== 11 || /^(\d)\1+$/.test(digitos)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i += 1) soma += Number(digitos[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(digitos[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i += 1) soma += Number(digitos[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === Number(digitos[10]);
}

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function sanitizarNome(valor: string): string {
  return valor
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'\-]/g, "")
    .replace(/\s{2,}/g, " ")
    .trimStart();
}

function validarNomeCompletoSomenteLetras(nome: string): boolean {
  const nomeLimpo = nome.trim();
  if (nomeLimpo.length < 5) return false;

  return /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[\s'\-][A-Za-zÀ-ÖØ-öø-ÿ]+)+$/.test(nomeLimpo);
}

export default function ImpulsionarPrestadorView() {
  const { user, logado, carregando } = useAuth();
  const [usuario, setUsuario] = useState<UsuarioApi | null>(null);
  const [prestador, setPrestador] = useState<PrestadorApi | null>(null);
  const [assinaturaAtiva, setAssinaturaAtiva] = useState<AssinaturaApi | null>(null);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [exibirPagamento, setExibirPagamento] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento>("pix");
  const [confirmacaoPix, setConfirmacaoPix] = useState(false);
  const [cartao, setCartao] = useState({ numero: "", nome: "", validade: "", cvv: "" });
  const [boleto, setBoleto] = useState({ nome: "", cpf: "", email: "" });
  const [errosPagamento, setErrosPagamento] = useState<ErrosPagamento>({});
  const [mostrarCelebracao, setMostrarCelebracao] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  const atualizarCampoCartao = (campo: "numero" | "nome" | "validade" | "cvv", valor: string) => {
    let valorTratado = valor;
    if (campo === "numero") valorTratado = formatarNumeroCartao(valor);
    if (campo === "validade") valorTratado = formatarValidade(valor);
    if (campo === "cvv") valorTratado = formatarCVV(valor);
    if (campo === "nome") valorTratado = sanitizarNome(valor).toUpperCase();
    setCartao((prev) => ({ ...prev, [campo]: valorTratado }));
    setErrosPagamento((prev) => ({ ...prev, [campo]: "" }));
  };

  const atualizarCampoBoleto = (campo: "nome" | "cpf" | "email", valor: string) => {
    let valorTratado = valor;
    if (campo === "cpf") valorTratado = formatarCPF(valor);
    if (campo === "nome") valorTratado = sanitizarNome(valor);
    setBoleto((prev) => ({ ...prev, [campo]: valorTratado }));
    setErrosPagamento((prev) => ({ ...prev, [campo]: "" }));
  };

  const trocarMetodoPagamento = (metodo: MetodoPagamento) => {
    setMetodoPagamento(metodo);
    setErrosPagamento({});
    setMensagemErro("");
  };

  const validarFormularioPagamento = () => {
    const erros: ErrosPagamento = {};

    if (metodoPagamento === "pix") {
      if (!confirmacaoPix) {
        erros.confirmacaoPix = "Confirme que você vai pagar com o código PIX para continuar.";
      }
    }

    if (metodoPagamento === "cartao") {
      const numeroCartao = apenasDigitos(cartao.numero);
      if (numeroCartao.length !== 16) erros.numero = "Informe os 16 dígitos do cartão.";

      if (!validarNomeCompletoSomenteLetras(cartao.nome)) {
        erros.nome = "Informe nome completo apenas com letras, sem números.";
      }

      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cartao.validade)) {
        erros.validade = "Validade inválida. Use o formato MM/AA.";
      }

      const cvv = apenasDigitos(cartao.cvv);
      if (cvv.length < 3 || cvv.length > 4) {
        erros.cvv = "CVV inválido. Use 3 ou 4 dígitos.";
      }
    }

    if (metodoPagamento === "boleto") {
      if (!validarNomeCompletoSomenteLetras(boleto.nome)) {
        erros.nomeBoleto = "Informe nome completo apenas com letras, sem números.";
      }

      if (!validarCPF(boleto.cpf)) {
        erros.cpf = "CPF inválido.";
      }

      if (!validarEmail(boleto.email)) {
        erros.email = "Email inválido.";
      }
    }

    setErrosPagamento(erros);
    if (Object.keys(erros).length > 0) {
      setMensagemErro("Revise os campos obrigatórios destacados para continuar.");
      return false;
    }

    return true;
  };

  const carregarDados = useCallback(async () => {
    if (!user?.id) {
      setCarregandoDados(false);
      return;
    }

    setCarregandoDados(true);
    setMensagemErro("");

    try {
      const idUsuario = Number(user.id);
      if (Number.isNaN(idUsuario)) {
        throw new Error("Não foi possível identificar o usuário logado.");
      }

      const [resUsuario, resPrestador] = await Promise.all([
        fetch(`/api/usuario/${idUsuario}`),
        fetch(`/api/prestador/por-usuario/${idUsuario}`),
      ]);

      const dadosUsuario = await resUsuario.json();
      if (!resUsuario.ok) {
        throw new Error(dadosUsuario.erro || "Erro ao carregar dados do usuário.");
      }
      setUsuario(dadosUsuario);

      if (dadosUsuario.status_conta && dadosUsuario.status_conta !== "ativo") {
        throw new Error("Sua conta está inativa e não pode assinar o plano neste momento.");
      }

      if (!resPrestador.ok) {
        const erroPrestador = await resPrestador.json();
        throw new Error(erroPrestador.erro || "Perfil de prestador não encontrado.");
      }

      const dadosPrestador = await resPrestador.json();
      setPrestador(dadosPrestador);

      const resAssinatura = await fetch(
        `/api/assinaturaPlano?id_prestador=${dadosPrestador.id_usuario}&ativa=true`
      );
      const dadosAssinatura = await resAssinatura.json();

      if (!resAssinatura.ok) {
        throw new Error(dadosAssinatura.error || "Erro ao consultar assinatura ativa.");
      }

      setAssinaturaAtiva(dadosAssinatura || null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao carregar dados.";
      setMensagemErro(msg);
      setUsuario(null);
      setPrestador(null);
      setAssinaturaAtiva(null);
    } finally {
      setCarregandoDados(false);
    }
  }, [user?.id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const lidarComAssinatura = () => {
    setMensagemErro("");
    setMensagemSucesso("");
    setErrosPagamento({});

    if (!user?.id || !prestador?.id_usuario) {
      setMensagemErro("Não foi possível identificar os dados do prestador.");
      return;
    }

    if (assinaturaAtiva?.ativo) {
      setMensagemErro("Você já possui uma assinatura ativa.");
      return;
    }

    setExibirPagamento(true);
  };

  const confirmarPagamento = async () => {
    setMensagemErro("");
    setMensagemSucesso("");

    if (!validarFormularioPagamento()) {
      return;
    }

    if (!user?.id || !prestador?.id_usuario) {
      setMensagemErro("Dados de prestador indisponíveis para efetivar assinatura.");
      return;
    }

    if (assinaturaAtiva?.ativo) {
      setMensagemErro("Você já possui uma assinatura ativa.");
      return;
    }

    setProcessandoPagamento(true);

    try {
      const hoje = new Date();
      const fim = new Date(hoje);
      fim.setMonth(fim.getMonth() + 1);

      const resCriarAssinatura = await fetch("/api/assinaturaPlano", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_prestador: prestador.id_usuario,
          valor_pago: 29.9,
          data_inicio: hoje.toISOString().slice(0, 10),
          data_fim: fim.toISOString().slice(0, 10),
          status_pagamento: "pago",
          ativo: true,
        }),
      });

      const dadosAssinatura = await resCriarAssinatura.json();

      if (!resCriarAssinatura.ok) {
        throw new Error(dadosAssinatura.error || "Não foi possível criar a assinatura.");
      }

      const resAtualizarPrestador = await fetch(`/api/prestador/por-usuario/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ impulsiona_perfil: true }),
      });

      if (!resAtualizarPrestador.ok) {
        const erroPrestador = await resAtualizarPrestador.json();
        throw new Error(
          erroPrestador.erro || "Assinatura criada, mas não foi possível atualizar o prestador."
        );
      }

      const metodoLegivel =
        metodoPagamento === "cartao"
          ? "cartão"
          : metodoPagamento === "boleto"
          ? "boleto"
          : "PIX";

      setMensagemSucesso(`Pagamento via ${metodoLegivel} aprovado. Seu perfil está impulsionado.`);
      setExibirPagamento(false);
      setConfirmacaoPix(false);
      setMostrarCelebracao(true);
      setTimeout(() => setMostrarCelebracao(false), 4500);
      await carregarDados();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao confirmar pagamento.";
      setMensagemErro(msg);
    } finally {
      setProcessandoPagamento(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-600">
        Carregando sua sessão...
      </div>
    );
  }

  if (!logado) {
    return (
      <div className="mx-auto mt-8 sm:mt-14 w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-4 sm:p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Entre para acessar</h2>
        <p className="mt-2 text-sm text-gray-600">
          Faça login para acessar o impulsionamento e concluir sua assinatura.
        </p>
        <Link
          href="/login?callbackUrl=/impulsionarPrestador"
          className="mt-5 inline-flex rounded-xl bg-[#12a14b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f8a3f]"
        >
          Ir para login
        </Link>
      </div>
    );
  }

  if (user && !user.isPrestador) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-600">
        Esta funcionalidade está disponível apenas para contas de prestador.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white w-full">
      {/* Barra de Busca no Topo */}
      <SearchBar />

      {mostrarCelebracao && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/20 backdrop-blur-[2px]">
          {[...Array(36)].map((_, i) => (
            <span
              key={`confete-${i}`}
              className="absolute animate-bounce rounded-sm"
              style={{
                left: `${(i * 9) % 100}%`,
                top: `${(i * 13) % 55}%`,
                width: `${6 + (i % 4)}px`,
                height: `${10 + (i % 5)}px`,
                transform: `rotate(${(i * 17) % 360}deg)`,
                backgroundColor: i % 4 === 0 ? "#16a34a" : i % 4 === 1 ? "#22c55e" : i % 4 === 2 ? "#86efac" : "#bef264",
                animationDelay: `${(i % 10) * 0.08}s`,
                animationDuration: `${0.9 + (i % 5) * 0.18}s`,
              }}
            />
          ))}

          <div className="relative w-[min(92vw,34rem)] overflow-hidden rounded-3xl border border-emerald-200/70 bg-white px-8 py-10 text-center shadow-2xl">
            <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-emerald-200/50 blur-2xl" />
            <div className="absolute -bottom-12 -right-8 h-40 w-40 rounded-full bg-lime-200/50 blur-3xl" />

            <div className="relative mx-auto mb-5 h-20 w-20">
              <span className="absolute inset-0 rounded-full bg-emerald-300/40 animate-ping" />
              <span className="absolute inset-2 rounded-full bg-emerald-200/60 animate-ping [animation-delay:140ms]" />
              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-emerald-600 text-3xl text-white shadow-lg">
                ✓
              </div>
            </div>

            <div className="relative">
              <p className="text-2xl font-extrabold tracking-tight text-emerald-800">Assinatura concluída</p>
              <p className="mt-2 text-sm font-medium text-emerald-700">
                Pagamento confirmado com sucesso. Seu perfil entrou no modo destaque.
              </p>
              <p className="mt-4 text-xs uppercase tracking-[0.16em] text-emerald-600/80">Benvi Premium Ativo</p>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {/* Cabeçalho da Página */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-black mb-2">
            Impulsionar Perfil
          </h1>
          <p className="text-xl text-black font-medium">
            {usuario?.nome
              ? `${usuario.nome}, destaque-se na Benvi e consiga mais clientes!`
              : "Destaque-se na Benvi e consiga mais clientes!"}
          </p>
        </div>

        {mensagemErro && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {mensagemErro}
          </div>
        )}

        {mensagemSucesso && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {mensagemSucesso}
          </div>
        )}

        {/* Container do Card Centralizado */}
        <div className="flex justify-center items-start">
          {/* Card de Assinatura com a Sombra em Degradê Verde */}
          <div className="w-full max-w-3xl border border-gray-200 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-10 bg-white shadow-[0_20px_40px_-15px_rgba(22,163,74,0.15),0_1px_3px_rgba(0,0,0,0.05)]">
            
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-black tracking-tight">Impulsionado</h2>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">
                Plano Destaque
              </p>
            </div>

            <hr className="border-gray-100 mb-8" />

            {/* Grid de Benefícios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-10 px-4">
              <BeneficioItem texto="Tudo no Destaque" />
              <BeneficioItem texto="Aparece no Topo das buscas regionais" />
              <BeneficioItem texto="Aparece no topo de buscas da cidade" />
              <BeneficioItem texto="Painel de Estatísticas de Perfil" />
              <BeneficioItem texto="Selo de perfil destaque" />
              <BeneficioItem texto="Prioridade no Suporte" />
            </div>

            {/* Preço e Botão com Animações e Clique */}
            <div className="text-center flex flex-col items-center justify-center">
              <div className="mb-6 select-none">
                <span className="text-3xl font-bold text-black">R$ 29,90</span>
                <span className="text-sm text-gray-500 font-medium"> / mês</span>
              </div>

              {assinaturaAtiva?.ativo && (
                <p className="mb-4 rounded-full bg-green-100 px-4 py-1.5 text-xs font-semibold text-green-700">
                  Assinatura ativa até {new Date(assinaturaAtiva.data_fim).toLocaleDateString("pt-BR")}
                </p>
              )}
              
              <button 
                onClick={lidarComAssinatura}
                disabled={carregandoDados || processandoPagamento || !!assinaturaAtiva?.ativo}
                className="bg-[#12a14b] hover:bg-[#0f8a3f] active:bg-[#0c6e32] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-20 rounded-xl transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-green-600/20 cursor-pointer"
              >
                {carregandoDados
                  ? "Carregando..."
                  : processandoPagamento
                  ? "Processando pagamento..."
                  : assinaturaAtiva?.ativo
                  ? "Plano Ativo"
                  : "Escolher pagamento"}
              </button>

              {exibirPagamento && !assinaturaAtiva?.ativo && (
                <div className="mt-6 w-full max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left">
                  <p className="mb-3 text-sm font-bold text-emerald-800">Escolha a forma de pagamento</p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <MetodoPagamentoCard
                      titulo="PIX"
                      descricao="Aprovação imediata"
                      selecionado={metodoPagamento === "pix"}
                      onClick={() => trocarMetodoPagamento("pix")}
                    />
                    <MetodoPagamentoCard
                      titulo="Cartão"
                      descricao="Crédito ou débito"
                      selecionado={metodoPagamento === "cartao"}
                      onClick={() => trocarMetodoPagamento("cartao")}
                    />
                    <MetodoPagamentoCard
                      titulo="Boleto"
                      descricao="Pagamento bancário"
                      selecionado={metodoPagamento === "boleto"}
                      onClick={() => trocarMetodoPagamento("boleto")}
                    />
                  </div>

                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4">
                    {metodoPagamento === "pix" && (
                      <PixPreview
                        confirmado={confirmacaoPix}
                        erro={errosPagamento.confirmacaoPix}
                        onToggle={(valor) => {
                          setConfirmacaoPix(valor);
                          setErrosPagamento((prev) => ({ ...prev, confirmacaoPix: "" }));
                        }}
                      />
                    )}
                    {metodoPagamento === "cartao" && (
                      <CartaoPreview
                        dados={cartao}
                        erros={errosPagamento}
                        onChange={atualizarCampoCartao}
                      />
                    )}
                    {metodoPagamento === "boleto" && (
                      <BoletoPreview
                        dados={boleto}
                        erros={errosPagamento}
                        onChange={atualizarCampoBoleto}
                      />
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={confirmarPagamento}
                      disabled={processandoPagamento}
                      className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {processandoPagamento ? "Confirmando..." : "Confirmar pagamento"}
                    </button>
                    <button
                      onClick={() => {
                        setExibirPagamento(false);
                        setErrosPagamento({});
                        setMensagemErro("");
                      }}
                      disabled={processandoPagamento}
                      className="rounded-xl border border-emerald-300 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// Componente auxiliar para os itens de check (com o círculo da imagem image_861ae6.png)
function BeneficioItem({ texto }: { texto: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <svg
        className="w-5 h-5 text-[#12a14b] flex-shrink-0 transition-transform group-hover:scale-110"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <span className="text-sm text-gray-700 font-medium">{texto}</span>
    </div>
  );
}

type MetodoPagamentoCardProps = {
  titulo: string;
  descricao: string;
  selecionado: boolean;
  onClick: () => void;
};

function MetodoPagamentoCard({ titulo, descricao, selecionado, onClick }: MetodoPagamentoCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
        selecionado
          ? "border-emerald-500 bg-emerald-100 text-emerald-900"
          : "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-100"
      }`}
    >
      <span className="block">{titulo}</span>
      <span className="mt-1 block text-xs font-medium text-emerald-700/80">{descricao}</span>
    </button>
  );
}

type PixPreviewProps = {
  confirmado: boolean;
  erro?: string;
  onToggle: (valor: boolean) => void;
};

function PixPreview({ confirmado, erro, onToggle }: PixPreviewProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold text-gray-900">Pague com PIX</p>
        <p className="text-xs text-gray-600">
          Use o QR Code abaixo ou copie o código para pagar no app do seu banco.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 text-center text-xs font-semibold text-emerald-700">
          QR Code PIX
        </div>

        <div className="flex-1 rounded-xl bg-gray-50 p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Copia e cola</p>
          <p className="break-all font-mono text-xs text-gray-700">{PIX_COPIA_COLA}</p>
        </div>
      </div>

      <label className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${erro ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
        <input
          type="checkbox"
          checked={confirmado}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-emerald-600"
        />
        <span className="text-gray-700">Confirmo que vou concluir o pagamento com os dados PIX acima. <strong className="text-red-600">*</strong></span>
      </label>
      {erro && <p className="text-xs font-medium text-red-600">{erro}</p>}
    </div>
  );
}

type CartaoPreviewProps = {
  dados: { numero: string; nome: string; validade: string; cvv: string };
  erros: ErrosPagamento;
  onChange: (campo: "numero" | "nome" | "validade" | "cvv", valor: string) => void;
};

function CartaoPreview({ dados, erros, onChange }: CartaoPreviewProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold text-gray-900">Pague com cartão</p>
        <p className="text-xs text-gray-600">
          Preencha os dados abaixo para simular a confirmação do pagamento.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-gray-600">Número do cartão <strong className="text-red-600">*</strong></span>
          <input
            type="text"
            placeholder="0000 0000 0000 0000"
            value={dados.numero}
            onChange={(e) => onChange("numero", e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 font-mono text-sm outline-none transition focus:border-emerald-400 ${erros.numero ? "border-red-300 bg-red-50" : "border-gray-200"}`}
          />
          {erros.numero && <p className="mt-1 text-xs font-medium text-red-600">{erros.numero}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-gray-600">Nome impresso <strong className="text-red-600">*</strong></span>
          <input
            type="text"
            placeholder="Nome do titular"
            value={dados.nome}
            onChange={(e) => onChange("nome", e.target.value.toUpperCase())}
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-400 ${erros.nome ? "border-red-300 bg-red-50" : "border-gray-200"}`}
          />
          {erros.nome && <p className="mt-1 text-xs font-medium text-red-600">{erros.nome}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-gray-600">Validade <strong className="text-red-600">*</strong></span>
          <input
            type="text"
            placeholder="MM/AA"
            value={dados.validade}
            onChange={(e) => onChange("validade", e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 font-mono text-sm outline-none transition focus:border-emerald-400 ${erros.validade ? "border-red-300 bg-red-50" : "border-gray-200"}`}
          />
          {erros.validade && <p className="mt-1 text-xs font-medium text-red-600">{erros.validade}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-gray-600">CVV <strong className="text-red-600">*</strong></span>
          <input
            type="text"
            placeholder="123"
            value={dados.cvv}
            onChange={(e) => onChange("cvv", e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 font-mono text-sm outline-none transition focus:border-emerald-400 ${erros.cvv ? "border-red-300 bg-red-50" : "border-gray-200"}`}
          />
          {erros.cvv && <p className="mt-1 text-xs font-medium text-red-600">{erros.cvv}</p>}
        </label>
      </div>
    </div>
  );
}

type BoletoPreviewProps = {
  dados: { nome: string; cpf: string; email: string };
  erros: ErrosPagamento;
  onChange: (campo: "nome" | "cpf" | "email", valor: string) => void;
};

function BoletoPreview({ dados, erros, onChange }: BoletoPreviewProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold text-gray-900">Pague com boleto</p>
        <p className="text-xs text-gray-600">
          Gere o boleto abaixo e use a linha digitável no seu banco ou app favorito.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Linha digitável</p>
        <p className="mt-2 break-all text-sm text-amber-900">
          34191.79001 01043.510047 91020.150008 8 97070000002990
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-gray-600">Nome completo do pagador <strong className="text-red-600">*</strong></span>
          <input
            type="text"
            placeholder="Nome completo"
            value={dados.nome}
            onChange={(e) => onChange("nome", e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-400 ${erros.nomeBoleto ? "border-red-300 bg-red-50" : "border-gray-200"}`}
          />
          {erros.nomeBoleto && <p className="mt-1 text-xs font-medium text-red-600">{erros.nomeBoleto}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-gray-600">CPF <strong className="text-red-600">*</strong></span>
          <input
            type="text"
            placeholder="000.000.000-00"
            value={dados.cpf}
            onChange={(e) => onChange("cpf", e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 font-mono text-sm outline-none transition focus:border-emerald-400 ${erros.cpf ? "border-red-300 bg-red-50" : "border-gray-200"}`}
          />
          {erros.cpf && <p className="mt-1 text-xs font-medium text-red-600">{erros.cpf}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-gray-600">Email para envio <strong className="text-red-600">*</strong></span>
          <input
            type="email"
            placeholder="voce@exemplo.com"
            value={dados.email}
            onChange={(e) => onChange("email", e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-400 ${erros.email ? "border-red-300 bg-red-50" : "border-gray-200"}`}
          />
          {erros.email && <p className="mt-1 text-xs font-medium text-red-600">{erros.email}</p>}
        </label>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
        <span className="font-medium text-gray-600">Vencimento</span>
        <span className="font-bold text-gray-900">3 dias úteis</span>
      </div>
    </div>
  );
}
