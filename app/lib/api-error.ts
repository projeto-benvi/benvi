import { NextResponse } from 'next/server';

type ApiErrorOptions = {
  context: string;
  publicMessage: string;
  status?: number;
  field?: 'error' | 'erro';
};

export function logSafeApiError(context: string, error: unknown) {
  const code =
    error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
      ? error.code
      : undefined;

  console.error('Falha interna em API.', {
    contexto: context,
    tipo: error instanceof Error ? error.name : typeof error,
    codigo: code,
  });
}

export function genericApiError(error: unknown, options: ApiErrorOptions) {
  logSafeApiError(options.context, error);
  const field = options.field ?? 'error';
  return NextResponse.json(
    { [field]: options.publicMessage },
    { status: options.status ?? 500 }
  );
}
