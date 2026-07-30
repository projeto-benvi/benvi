import pool from '@/app/lib/dataBase';
import {
  AuthorizationError,
  type AuthenticatedUser,
} from '@/app/lib/authz';

export async function assertConversaParticipant(
  idConversa: number,
  user: AuthenticatedUser
) {
  if (!Number.isSafeInteger(idConversa) || idConversa <= 0) {
    throw new AuthorizationError('Conversa inválida.', 400);
  }

  const [rows]: any = await pool.query(
    'SELECT idUsuario, idPrestador FROM conversas WHERE idConversa = ? LIMIT 1',
    [idConversa]
  );
  const conversa = rows[0];

  if (!conversa) throw new AuthorizationError('Conversa não encontrada.', 404);
  if (
    Number(conversa.idUsuario) !== user.id &&
    Number(conversa.idPrestador) !== user.id
  ) {
    throw new AuthorizationError('Você não tem permissão para acessar esta conversa.', 403);
  }
}
