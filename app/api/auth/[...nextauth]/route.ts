import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { usuarioService } from '@/service/usuarioService';
import pool from '@/app/lib/dataBase';
import { RowDataPacket } from 'mysql2/promise';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const usuario = await usuarioService.validarLogin(
          credentials.email,
          credentials.password
        );

        if (!usuario) return null;

        const [prestadorRows] = await pool.query<RowDataPacket[]>(
          'SELECT id_usuario FROM prestador WHERE id_usuario = ?',
          [usuario.id_usuario]
        );

        return {
          id: String(usuario.id_usuario),
          name: usuario.nome,
          email: usuario.email,
          image: usuario.foto_perfil ?? null,
          role: usuario.is_admin ? 'admin' : String(usuario.nivel_acesso),
          nivelAcesso: usuario.nivel_acesso,
          isAdmin: usuario.is_admin,
          isPrestador: prestadorRows.length > 0,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Login inicial com credentials
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.nivelAcesso = (user as any).nivelAcesso;
        token.isAdmin = (user as any).isAdmin;
        token.isPrestador = (user as any).isPrestador;
      }

      // Login com Google
      if (account?.provider === 'google') {
        const usuarioExistente = await usuarioService.buscarPorEmail(token.email!);

        if (usuarioExistente) {
          const [prestadorRows] = await pool.query<RowDataPacket[]>(
            'SELECT id_usuario FROM prestador WHERE id_usuario = ?',
            [usuarioExistente.id_usuario]
          );

          token.id = String(usuarioExistente.id_usuario);
          token.role = usuarioExistente.is_admin ? 'admin' : String(usuarioExistente.nivel_acesso);
          token.nivelAcesso = usuarioExistente.nivel_acesso;
          token.isAdmin = usuarioExistente.is_admin;
          token.isPrestador = prestadorRows.length > 0;
        } else {
          const novoId = await usuarioService.criar({
            nome: token.name!,
            email: token.email!,
            senha: '',
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
          token.isPrestador = false;
        }
      }

      // Chamado quando atualizarSessao() é disparado no frontend
      if (trigger === 'update') {
        const [rows] = await pool.query<RowDataPacket[]>(
          'SELECT foto_perfil, nome FROM usuario WHERE id_usuario = ?',
          [token.id]
        );
        const dadosAtualizados = (rows as any)[0];
        if (dadosAtualizados?.foto_perfil) {
          token.picture = dadosAtualizados.foto_perfil;
        }
        if (dadosAtualizados?.nome) {
          token.name = dadosAtualizados.nome;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).nivelAcesso = token.nivelAcesso;
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).isPrestador = token.isPrestador;
        session.user.image = token.picture as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
  },

  secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };