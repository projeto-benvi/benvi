import { NextResponse } from 'next/server';

/**
 * Converte um parâmetro de rota (ex.: `[id]`) em um inteiro positivo válido.
 * Retorna `null` quando o valor não é um inteiro válido (ex.: "abc", "-1", "1.5", "").
 */
export function parseIdParam(valor: string | null | undefined): number | null {
  if (valor === null || valor === undefined) return null;
  const texto = valor.trim();
  if (!/^\d+$/.test(texto)) return null;
  const numero = Number(texto);
  if (!Number.isInteger(numero) || numero <= 0) return null;
  return numero;
}

/**
 * Resposta 400 padrão para IDs inválidos em parâmetros de rota dinâmica.
 */
export function respostaIdInvalido(nomeCampo: string = 'id') {
  return NextResponse.json({ erro: `Parâmetro '${nomeCampo}' inválido.` }, { status: 400 });
}
