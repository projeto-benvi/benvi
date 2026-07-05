import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/dataBase';
import { authErrorResponse, requireResourceOwner, requireUser } from '@/app/lib/authz';
import { storageErrorStatus, uploadPublicImage } from '@/app/lib/storage';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const idUsuario = resolvedParams.id;
    const user = await requireUser();
    requireResourceOwner(user, idUsuario);

    const formData = await request.formData();
    const arquivo = formData.get('foto') as File | null;

    if (!arquivo) {
      return NextResponse.json({ erro: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const upload = await uploadPublicImage({
      file: arquivo,
      folder: 'avatars',
    });

    await pool.query(
      'UPDATE usuario SET foto_perfil = ? WHERE id_usuario = ?',
      [upload.url, idUsuario]
    );

    return NextResponse.json({
      mensagem: 'Foto de perfil atualizada com sucesso!',
      urlCompleta: upload.url,
      publicId: upload.publicId,
    }, { status: 200 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    console.error('Erro ao processar upload de foto de perfil.');
    return NextResponse.json(
      { erro: 'Nao foi possivel processar o upload da foto de perfil.' },
      { status: storageErrorStatus(error) }
    );
  }
}
