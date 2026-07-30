import { NextResponse } from 'next/server';
import { authErrorResponse, AuthorizationError, requireUser } from '@/app/lib/authz';
import { assertConversaParticipant } from '@/app/lib/conversa-access';
import {
  getPrivateChatAttachmentUrl,
  type ChatAttachmentResourceType,
} from '@/app/lib/storage';
import { MensagemService } from '@/service/mensagemService';

const mensagemService = new MensagemService();

type RouteContext = {
  params: Promise<{ mensagemId: string }>;
};

const FORMAT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'application/pdf': 'pdf',
};

function resourceTypeForMime(mimeType: string): ChatAttachmentResourceType | null {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'raw';
  return null;
}

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const user = await requireUser();
    const { mensagemId } = await params;
    const idMensagem = Number(mensagemId);
    if (!Number.isSafeInteger(idMensagem) || idMensagem <= 0) {
      throw new AuthorizationError('Mensagem inválida.', 400);
    }

    const anexo = await mensagemService.buscarAnexoPorMensagem(idMensagem);
    if (!anexo) throw new AuthorizationError('Anexo não encontrado.', 404);
    await assertConversaParticipant(Number(anexo.idConversa), user);

    const mimeType = String(anexo.arquivo_mime || '');
    const format = FORMAT_BY_MIME[mimeType];
    const resourceType = resourceTypeForMime(mimeType);
    if (!format || !resourceType || !anexo.arquivo_public_id) {
      throw new AuthorizationError('Anexo indisponível.', 404);
    }

    const signedUrl = getPrivateChatAttachmentUrl(
      String(anexo.arquivo_public_id),
      format,
      resourceType
    );
    return NextResponse.redirect(signedUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ erro: 'Não foi possível abrir o anexo.' }, { status: 500 });
  }
}
