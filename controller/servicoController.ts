import { servicoService } from '@/service/servicoService';
import { NextRequest, NextResponse } from 'next/server';
import { storageErrorStatus, uploadPublicImage, type StorageUploadResult } from '@/app/lib/storage';

type ServicoPayload = Record<string, any>;

const CAMPOS_SERVICO_PERMITIDOS = new Set([
  'id_prestador',
  'id_categoria',
  'titulo',
  'descricao',
  'status_servico',
  'data_inicio',
  'data_fim',
  'tempo_execucao',
  'imagens',
]);

function filtrarPayloadServico(payload: ServicoPayload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([campo]) => CAMPOS_SERVICO_PERMITIDOS.has(campo))
  );
}

function formValue(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

function isUploadFile(value: FormDataEntryValue): value is File {
  return value instanceof File && value.size > 0;
}

function extrairArquivosDeImagem(form: FormData) {
  const arquivos = [
    ...form.getAll('imagens'),
    ...form.getAll('fotos'),
    ...form.getAll('images'),
  ];

  return arquivos.filter(isUploadFile).slice(0, 5);
}

function normalizarImagem(upload: StorageUploadResult) {
  return {
    url: upload.url,
    publicId: upload.publicId,
  };
}

async function parseServicoRequest(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';

  if (!contentType.includes('multipart/form-data')) {
    return filtrarPayloadServico(await req.json());
  }

  const form = await req.formData();
  const payload: ServicoPayload = filtrarPayloadServico({
    id_categoria: formValue(form, 'id_categoria'),
    titulo: formValue(form, 'titulo'),
    descricao: formValue(form, 'descricao'),
    status_servico: formValue(form, 'status_servico'),
    data_inicio: formValue(form, 'data_inicio'),
    data_fim: formValue(form, 'data_fim'),
    tempo_execucao: formValue(form, 'tempo_execucao'),
  });

  const arquivos = extrairArquivosDeImagem(form);
  if (arquivos.length > 0) {
    const uploads = await Promise.all(
      arquivos.map((file) => uploadPublicImage({ file, folder: 'services' }))
    );
    payload.imagens = uploads.map(normalizarImagem);
  }

  return payload;
}

export const servicoController = {

  // Lista os serviços de um prestador específico
  async listar(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const idPrestador = searchParams.get('id_prestador');

      if (!idPrestador) {
        return NextResponse.json(
          { erro: 'id_prestador é obrigatório' },
          { status: 400 }
        );
      }

      const servicos = await servicoService.buscarPorPrestador(Number(idPrestador));
      return NextResponse.json(servicos);
    } catch {
      return NextResponse.json(
        { erro: 'Erro ao listar serviços' },
        { status: 500 }
      );
    }
  },

  async criar(req: NextRequest, idPrestadorAutenticado?: number) {
    try {
      const body = await parseServicoRequest(req);
      if (idPrestadorAutenticado) body.id_prestador = idPrestadorAutenticado;
      const id = await servicoService.criar(body);
      return NextResponse.json({ id_servico: id, imagens: body.imagens ?? [] }, { status: 201 });
    } catch (e) {
      console.error('Erro ao criar serviço.');
      return NextResponse.json(
        { erro: 'Erro ao criar serviço' },
        { status: storageErrorStatus(e) }
      );
    }
  },

  async buscarPorId(id: number) {
    try {
      const servico = await servicoService.buscarPorId(id);
      if (!servico) {
        return NextResponse.json({ erro: 'Serviço não encontrado' }, { status: 404 });
      }
      return NextResponse.json(servico);
    } catch {
      return NextResponse.json(
        { erro: 'Erro ao buscar serviço' },
        { status: 500 }
      );
    }
  },

  async atualizar(id: number, req: NextRequest) {
    try {
      const body = await parseServicoRequest(req);
      await servicoService.atualizar(id, body);
      return NextResponse.json({ mensagem: 'Atualizado com sucesso', imagens: body.imagens });
    } catch (e) {
      console.error('Erro ao atualizar serviço.');
      return NextResponse.json(
        { erro: 'Erro ao atualizar serviço' },
        { status: storageErrorStatus(e) }
      );
    }
  },

  async deletar(id: number) {
    try {
      await servicoService.deletar(id);
      return NextResponse.json({ mensagem: 'Deletado com sucesso' });
    } catch {
      return NextResponse.json(
        { erro: 'Erro ao deletar serviço' },
        { status: 500 }
      );
    }
  },
};
