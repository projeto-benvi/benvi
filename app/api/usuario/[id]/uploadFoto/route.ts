import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/dataBase';
import { authErrorResponse, requireResourceOwner, requireUser } from '@/app/lib/authz';
import { storageErrorStatus, uploadPublicFile } from '@/app/lib/storage';

const MAX_FILE_SIZE_MB = Number(process.env.STORAGE_MAX_FILE_SIZE_MB ?? 5);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

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

    if (!ALLOWED_IMAGE_TYPES.has(arquivo.type)) {
      return NextResponse.json({ erro: 'Tipo de arquivo não permitido.' }, { status: 400 });
    }

    if (arquivo.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ erro: `Arquivo maior que ${MAX_FILE_SIZE_MB}MB.` }, { status: 400 });
    }

    const upload = await uploadPublicFile({
      file: arquivo,
      keyPrefix: `usuarios/${idUsuario}/perfil`,
    });

    await pool.query(
      'UPDATE usuario SET foto_perfil = ? WHERE id_usuario = ?',
      [upload.url, idUsuario]
    );

    return NextResponse.json({ 
      mensagem: 'Foto de perfil atualizada com sucesso!', 
      urlCompleta: upload.url 
    }, { status: 200 });

  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    console.error('Erro crítico na rota de uploadFoto:', error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : 'Erro interno ao processar upload.' },
      { status: storageErrorStatus(error) }
    );
  }
}
