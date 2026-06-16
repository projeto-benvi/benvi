

import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { usuarioService } from '@/service/usuarioService';

export const authOptions: NextAuthOptions = {
  providers: [

    // ── Email + Senha ────────────────────────────────────────────────────────
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Chama o service diretamente — sem fetch, sem rota intermediária
        // O validarLogin já verifica a senha com bcrypt e retorna null se errar
        const usuario = await usuarioService.validarLogin(
          credentials.email,
          credentials.password
        );

        if (!usuario) return null;

        // O que retornar aqui vai ficar salvo no cookie de sessão (criptografado)
        return {
          id: String(usuario.id_usuario),
          name: usuario.nome,
          email: usuario.email,
          image: usuario.foto_perfil ?? null,
          // Campos extras do seu banco:
          role: usuario.is_admin ? 'admin' : String(usuario.nivel_acesso),
          nivelAcesso: usuario.nivel_acesso,
          isAdmin: usuario.is_admin,
        };
      },
    }),

    // ── Google ───────────────────────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // jwt() → roda ao criar/renovar o token
    // Aqui "colamos" os campos extras (role, isAdmin) no cookie
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.nivelAcesso = (user as any).nivelAcesso;
        token.isAdmin = (user as any).isAdmin;
      }

      // Login via Google: tenta achar o usuário no banco pelo email
      // Se não existir, cria automaticamente
      if (account?.provider === 'google') {
        const usuarioExistente = await usuarioService.buscarPorEmail(token.email!);

        if (usuarioExistente) {
          token.id = String(usuarioExistente.id_usuario);
          token.role = usuarioExistente.is_admin ? 'admin' : String(usuarioExistente.nivel_acesso);
          token.nivelAcesso = usuarioExistente.nivel_acesso;
          token.isAdmin = usuarioExistente.is_admin;
        } else {
          // Primeiro login com Google → cria o usuário no banco
          const novoId = await usuarioService.criar({
            nome: token.name!,
            email: token.email!,
            senha: '', // sem senha (login só via Google)
            foto_perfil: token.picture ?? '',
            telefone: '',
            cpf: '',
            data_nascimento: null,
            cidade: '',
            nivel_acesso: 1,
            status_conta: 'ativo',
            is_admin: false,
          } as any);
          token.id = String(novoId);
          token.role = '1';
          token.nivelAcesso = 1;
          token.isAdmin = false;
        }
      }

      return token;
    },

    // session() → roda quando o frontend pede a sessão
    // O que você colocar aqui fica acessível via useAuth() / getServerSession()
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).nivelAcesso = token.nivelAcesso;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login', // usa sua própria tela de login
  },

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // sessão dura 7 dias
  },

  secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };