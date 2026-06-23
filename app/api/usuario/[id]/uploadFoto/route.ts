import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/dataBase';
import fs from 'fs';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const idUsuario = resolvedParams.id;
    
    const formData = await request.formData();
    const arquivo = formData.get('foto') as File | null;

    if (!arquivo) {
      return NextResponse.json({ erro: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const bytes = await arquivo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const diretorioUpload = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(diretorioUpload)) {
      fs.mkdirSync(diretorioUpload, { recursive: true });
    }

    try {
      const [usuarios]: any = await pool.query(
        'SELECT foto_perfil FROM usuario WHERE id_usuario = ?',
        [idUsuario]
      );
      
      if (usuarios && usuarios.length > 0) {
        const fotoAntiga = usuarios[0].foto_perfil;
        
        if (fotoAntiga && fotoAntiga.startsWith('/uploads/')) {
          const caminhoFotoAntiga = path.join(process.cwd(), 'public', fotoAntiga);
          if (fs.existsSync(caminhoFotoAntiga)) {
            fs.unlinkSync(caminhoFotoAntiga);
          }
        }
      }
    } catch (err) {
      console.warn('Falha ao tentar remover foto antiga:', err);
    }

    const extensao = path.extname(arquivo.name) || '.jpg';
    const nomeArquivo = `usuario_${idUsuario}_${Date.now()}${extensao}`;
    const caminhoNoDisco = path.join(diretorioUpload, nomeArquivo);

    fs.writeFileSync(caminhoNoDisco, buffer);

    const urlPublicaDaFoto = `/uploads/${nomeArquivo}`;
    await pool.query(
      'UPDATE usuario SET foto_perfil = ? WHERE id_usuario = ?',
      [urlPublicaDaFoto, idUsuario]
    );

    return NextResponse.json({ 
      mensagem: 'Foto de perfil atualizada com sucesso!', 
      urlCompleta: urlPublicaDaFoto 
    }, { status: 200 });

  } catch (error) {
    console.error('Erro crítico na rota de uploadFoto:', error);
    return NextResponse.json({ erro: 'Erro interno ao processar upload.' }, { status: 500 });
  }
}