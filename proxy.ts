// proxy.ts (raiz do projeto)

import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const ROTAS_PRIVADAS = [
  '/alerta',
  '/ajuda',
  '/editarUsuario',
  '/favoritos',
  '/meusPedidos',
  '/notificacoes',
  '/pedidos',
  '/perfil/usuario',
  '/mensagens',
  '/tela-configuracoes',
];

const ROTAS_PRESTADOR = [
  '/agendaPrestador',
  '/impulsionarPrestador',
  '/inicialPrestador',
  '/servicoPrestador',
  '/tela-inicial-prestador',
];

const ROTAS_ADMIN = ['/admin'];

// Rotas que usuário logado não deve acessar
const ROTAS_SO_DESLOGADO = ['/login', '/cadastro'];

function correspondeAlgumPrefixo(pathname: string, prefixos: string[]) {
  return prefixos.some((prefixo) => pathname === prefixo || pathname.startsWith(`${prefixo}/`));
}

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });
  const { pathname } = req.nextUrl;

  const ePrivada = correspondeAlgumPrefixo(pathname, ROTAS_PRIVADAS);
  const ePrestador = correspondeAlgumPrefixo(pathname, ROTAS_PRESTADOR);
  const eAdmin = correspondeAlgumPrefixo(pathname, ROTAS_ADMIN);
  const eSoDeslogado = correspondeAlgumPrefixo(pathname, ROTAS_SO_DESLOGADO);
  const callbackUrl = `${pathname}${req.nextUrl.search}`;

  // Sem sessão tentando acessar rota privada → manda pro login
  if (!token && (ePrivada || ePrestador || eAdmin)) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', callbackUrl);
    return NextResponse.redirect(url);
  }

  if (token && eAdmin && !token.isAdmin) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (token && ePrestador && !token.isPrestador && !token.isAdmin) {
    return NextResponse.redirect(new URL('/', req.url));
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
