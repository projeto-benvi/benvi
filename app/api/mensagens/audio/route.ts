import { NextResponse } from 'next/server';
import { authErrorResponse, requireUser } from '@/app/lib/authz';
import { assertConversaParticipant } from '@/app/lib/conversa-access';
import {
  deletePrivateChatAudio,
  storageErrorStatus,
  StorageUploadError,
  uploadPrivateChatAudio,
} from '@/app/lib/storage';
import { MensagemService } from '@/service/mensagemService';
import { logSafeApiError } from '@/app/lib/api-error';

const mensagemService = new MensagemService();

export async function POST(request: Request) {
  let uploadedPublicId: string | null = null;

  try {
    const user = await requireUser();
    const formData = await request.formData();
    const idConversa = Number(formData.get('idConversa'));
    await assertConversaParticipant(idConversa, user);

    const audio = formData.get('audio');
    if (!(audio instanceof File)) {
      return NextResponse.json({ erro: 'Arquivo de áudio obrigatório.' }, { status: 400 });
    }

    const uploaded = await uploadPrivateChatAudio(audio);
    uploadedPublicId = uploaded.publicId;

    const mensagem = await mensagemService.enviarMensagemAudio({
      idConversa,
      idRemetente: user.id,
      arquivoUrl: uploaded.secureUrl,
      arquivoPublicId: uploaded.publicId,
      arquivoMime: uploaded.mimeType,
      arquivoTamanho: uploaded.bytes,
      audioDuracao: uploaded.duration,
    });

    uploadedPublicId = null;
    const clientTempId = formData.get('clientTempId');
    return NextResponse.json(
      {
        ...mensagem,
        clientTempId:
          typeof clientTempId === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(clientTempId)
            ? clientTempId
            : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    if (uploadedPublicId) {
      await deletePrivateChatAudio(uploadedPublicId).catch(() => undefined);
    }

    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    logSafeApiError('mensagem.audio.enviar', error);

    const status = storageErrorStatus(error);
    const mensagem =
      status === 400
        ? 'Arquivo de áudio inválido.'
        : error instanceof StorageUploadError
          ? 'Não foi possível armazenar o áudio agora.'
          : status === 503
            ? 'O envio de áudio não está disponível agora.'
            : 'Não foi possível enviar o áudio.';

    return NextResponse.json({ erro: mensagem }, { status });
  }
}
