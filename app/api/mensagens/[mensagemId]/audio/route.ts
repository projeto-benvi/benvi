import { NextResponse } from 'next/server';
import { authErrorResponse, AuthorizationError, requireUser } from '@/app/lib/authz';
import { assertConversaParticipant } from '@/app/lib/conversa-access';
import { getPrivateChatAudioUrl } from '@/app/lib/storage';
import { MensagemService } from '@/service/mensagemService';

const mensagemService = new MensagemService();

type RouteContext = {
  params: Promise<{ mensagemId: string }>;
};

const FORMAT_BY_MIME: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'mp4',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const user = await requireUser();
    const { mensagemId } = await params;
    const idMensagem = Number(mensagemId);
    if (!Number.isSafeInteger(idMensagem) || idMensagem <= 0) {
      throw new AuthorizationError('Mensagem inválida.', 400);
    }

    const audio = await mensagemService.buscarAudioPorMensagem(idMensagem);
    if (!audio) throw new AuthorizationError('Áudio não encontrado.', 404);
    await assertConversaParticipant(Number(audio.idConversa), user);

    const format = FORMAT_BY_MIME[String(audio.arquivo_mime)];
    if (!format || !audio.arquivo_public_id) {
      throw new AuthorizationError('Áudio indisponível.', 404);
    }

    const signedUrl = getPrivateChatAudioUrl(String(audio.arquivo_public_id), format);
    return NextResponse.redirect(signedUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
        'Referrer-Policy': 'no-referrer',
      },
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ erro: 'Não foi possível reproduzir o áudio.' }, { status: 500 });
  }
}
