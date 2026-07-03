import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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

  return {
    id,
    isAdmin: Boolean((session.user as any).isAdmin),
    isPrestador: Boolean((session.user as any).isPrestador),
    nivelAcesso: Number((session.user as any).nivelAcesso) || undefined,
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
