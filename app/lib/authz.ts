import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/app/lib/dataBase";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2/promise";

export type AuthenticatedUser = {
  id: number;
  isAdmin: boolean;
  isPrestador: boolean;
  nivelAcesso?: number;
};

export class AuthorizationError extends Error {
  status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.status = status;
  }
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const session = await getServerSession(authOptions);
  const id = Number((session?.user as any)?.id);

  if (!session?.user || !Number.isInteger(id) || id <= 0) {
    throw new AuthorizationError("Autenticacao obrigatoria.", 401);
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       u.is_admin,
       u.nivel_acesso,
       u.status_conta,
       CASE
         WHEN p.id_usuario IS NOT NULL AND COALESCE(p.status_social, 'ativo') = 'ativo' THEN 1
         ELSE 0
       END AS is_prestador
     FROM usuario u
     LEFT JOIN prestador p ON p.id_usuario = u.id_usuario
     WHERE u.id_usuario = ?
     LIMIT 1`,
    [id]
  );

  const usuario = rows[0];

  if (!usuario || String(usuario.status_conta || "").toLowerCase() !== "ativo") {
    throw new AuthorizationError("Autenticacao obrigatoria.", 401);
  }

  return {
    id,
    isAdmin: Boolean(usuario.is_admin),
    isPrestador: Boolean(usuario.is_prestador),
    nivelAcesso: Number(usuario.nivel_acesso) || undefined,
  };
}

export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireUser();

  if (!user.isAdmin) {
    throw new AuthorizationError("Permissao de administrador obrigatoria.", 403);
  }

  return user;
}

export function requireResourceOwner(
  user: AuthenticatedUser,
  ownerId: number | string | null | undefined
) {
  const parsedOwnerId = Number(ownerId);

  if (!user.isAdmin && (!Number.isInteger(parsedOwnerId) || parsedOwnerId !== user.id)) {
    throw new AuthorizationError("Voce nao tem permissao para acessar este recurso.", 403);
  }
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthorizationError) {
    return NextResponse.json({ erro: error.message }, { status: error.status });
  }

  return null;
}
