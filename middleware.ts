// middleware.ts (raiz do projeto)

import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

// Prefixos de rotas que exigem login
// Ajuste conforme as pastas do seu projeto
const ROTAS_PRIVADAS = [
  '/perfil/usuario',
  '/agenda',
  '/conversas',
  '/mensagens',
  '/tela-configuracoes',
  '/tela-inicial-prestador',
];

// Rotas que usuário logado não deve acessar
const ROTAS_SO_DESLOGADO = ['/login', '/cadastro'];

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });
  const { pathname } = req.nextUrl;

  const ePrivada = ROTAS_PRIVADAS.some((r) => pathname.startsWith(r));
  const eSoDeslogado = ROTAS_SO_DESLOGADO.some((r) => pathname.startsWith(r));

  // Sem sessão tentando acessar rota privada → manda pro login
  if (!token && ePrivada) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Com sessão tentando acessar /login ou /cadastro → manda pro início
  if (token && eSoDeslogado) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};