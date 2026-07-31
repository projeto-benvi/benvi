import { NextResponse } from 'next/server';
import { authErrorResponse, requireUser } from '@/app/lib/authz';
import { assertConversaParticipant } from '@/app/lib/conversa-access';
import {
  deletePrivateChatAttachment,
  storageErrorStatus,
  StorageUploadError,
  type ChatAttachmentResourceType,
  uploadPrivateChatAttachment,
} from '@/app/lib/storage';
import { MensagemService } from '@/service/mensagemService';

const mensagemService = new MensagemService();

function nomeArquivoSeguro(nome: string) {
  return nome
    .normalize('NFKC')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
    .trim()
    .slice(0, 180) || 'anexo';
}

function tipoMensagem(mimeType: string): 'imagem' | 'video' | 'documento' {
  if (mimeType.startsWith('image/')) return 'imagem';
  if (mimeType.startsWith('video/')) return 'video';
  return 'documento';
}

export async function POST(request: Request) {
  let uploaded: { publicId: string; resourceType: ChatAttachmentResourceType } | null = null;

  try {
    const user = await requireUser();
    const formData = await request.formData();
    const idConversa = Number(formData.get('idConversa'));
    await assertConversaParticipant(idConversa, user);

    const arquivo = formData.get('arquivo');
    if (!(arquivo instanceof File)) {
      return NextResponse.json({ erro: 'Arquivo obrigatório.' }, { status: 400 });
    }

    const storageResult = await uploadPrivateChatAttachment(arquivo);
    uploaded = {
      publicId: storageResult.publicId,
      resourceType: storageResult.resourceType,
    };

    const mensagem = await mensagemService.enviarMensagemAnexo({
      idConversa,
      idRemetente: user.id,
      nomeArquivo: nomeArquivoSeguro(arquivo.name),
      tipoMensagem: tipoMensagem(storageResult.mimeType),
      arquivoUrl: storageResult.secureUrl,
      arquivoPublicId: storageResult.publicId,
      arquivoMime: storageResult.mimeType,
      arquivoTamanho: storageResult.bytes,
    });

    uploaded = null;
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
    if (uploaded) {
      await deletePrivateChatAttachment(uploaded.publicId, uploaded.resourceType).catch(
        () => undefined
      );
    }

    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    const status = storageErrorStatus(error);
    const mensagem =
      status === 400
        ? error instanceof Error
          ? error.message
          : 'Arquivo inválido.'
        : error instanceof StorageUploadError
          ? 'Não foi possível armazenar o anexo agora.'
          : status === 503
            ? 'O envio de anexos não está disponível agora.'
            : 'Não foi possível enviar o anexo.';

    return NextResponse.json({ erro: mensagem }, { status });
  }
}
