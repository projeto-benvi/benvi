"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);

  function solicitarAjuda(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnviado(true);
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-[#60A5FA] to-[#22C55E] p-4 sm:p-8 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-8 shadow-2xl">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800">
          <ArrowLeft size={17} />
          Voltar ao login
        </Link>

        <div className="py-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Mail size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Recuperar senha</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Informe o e-mail da sua conta para iniciar a recuperação.
          </p>
        </div>

        {enviado ? (
          <div role="status" aria-live="polite" className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Solicitação registrada. Para proteger sua conta, confirme a recuperação com o suporte usando o e-mail informado.
            <Link href="/ajuda" className="mt-4 block font-bold text-blue-700 hover:underline">
              Ir para a central de ajuda
            </Link>
          </div>
        ) : (
          <form onSubmit={solicitarAjuda} className="space-y-4">
            <div>
              <label htmlFor="email-recuperacao" className="mb-2 block text-sm font-semibold text-gray-700">
                E-mail
              </label>
              <input
                id="email-recuperacao"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@exemplo.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button type="submit" className="w-full rounded-xl bg-orange-500 py-3.5 font-semibold text-white transition hover:bg-orange-600">
              Continuar
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
