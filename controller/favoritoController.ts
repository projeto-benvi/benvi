import { favoritoService } from '@/service/favoritoService';
import { NextRequest, NextResponse } from 'next/server';

export const favoritoController = {
  async listar(req: NextRequest) {
    try {
      const idUsuario = Number(req.nextUrl.searchParams.get('id_usuario'));
      const termo = req.nextUrl.searchParams.get('termo') ?? undefined;
      const categoria = req.nextUrl.searchParams.get('categoria') ?? undefined;
      const cidade = req.nextUrl.searchParams.get('cidade') ?? undefined;
      const ordenarPor = (req.nextUrl.searchParams.get('ordenarPor') as
        | 'mais-recentes'
        | 'melhor-avaliados'
        | 'nome'
        | null) ?? undefined;
      const notaMinimaRaw = req.nextUrl.searchParams.get('notaMinima');

      const servicosPorArray = req.nextUrl.searchParams.getAll('servico');
      const servicosPorLista = (req.nextUrl.searchParams.get('servicos') || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const servicos = [...servicosPorArray, ...servicosPorLista].filter(Boolean);
      const notaMinima = notaMinimaRaw ? Number(notaMinimaRaw) : undefined;

      if (!idUsuario || Number.isNaN(idUsuario)) {
        return NextResponse.json(
          { erro: "Parâmetro 'id_usuario' é obrigatório." },
          { status: 400 }
        );
      }

      const favoritos = await favoritoService.listarPorUsuario(idUsuario, {
        termo,
        categoria,
        cidade,
        ordenarPor,
        notaMinima,
        servicos,
      });
      return NextResponse.json(favoritos, { status: 200 });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao listar favoritos.' }, { status: 500 });
    }
  },

  async buscarPorId(id_favorito: number) {
    try {
      const favorito = await favoritoService.buscarPorId(id_favorito);

      if (!favorito) {
        return NextResponse.json({ erro: 'Favorito não encontrado.' }, { status: 404 });
      }

      return NextResponse.json(favorito, { status: 200 });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao buscar favorito.' }, { status: 500 });
    }
  },

  async criar(req: NextRequest) {
    try {
      const body = await req.json();

      if (!body.id_usuario || !body.id_prestador) {
        return NextResponse.json(
          { erro: "Os campos 'id_usuario' e 'id_prestador' são obrigatórios." },
          { status: 400 }
        );
      }

      const id = await favoritoService.criar(body);
      return NextResponse.json({ id_favorito: id }, { status: 201 });
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
          { erro: 'Este prestador já está nos seus favoritos.' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { erro: 'Erro ao criar favorito.', detalhes: String(e) },
        { status: 500 }
      );
    }
  },

  async deletarPorId(id_favorito: number) {
    try {
      await favoritoService.deletarPorId(id_favorito);
      return NextResponse.json({ mensagem: 'Favorito removido com sucesso.' }, { status: 200 });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao remover favorito.' }, { status: 500 });
    }
  },

  async deletarPorUsuarioPrestador(req: NextRequest) {
    try {
      const idUsuario = Number(req.nextUrl.searchParams.get('id_usuario'));
      const idPrestador = Number(req.nextUrl.searchParams.get('id_prestador'));

      if (!idUsuario || Number.isNaN(idUsuario) || !idPrestador || Number.isNaN(idPrestador)) {
        return NextResponse.json(
          { erro: "Parâmetros 'id_usuario' e 'id_prestador' são obrigatórios." },
          { status: 400 }
        );
      }

      await favoritoService.deletarPorUsuarioPrestador(idUsuario, idPrestador);
      return NextResponse.json({ mensagem: 'Favorito removido com sucesso.' }, { status: 200 });
    } catch (e) {
      return NextResponse.json({ erro: 'Erro ao remover favorito.' }, { status: 500 });
    }
  }
};
