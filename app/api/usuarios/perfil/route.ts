import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/dataBase';
import { RowDataPacket } from 'mysql2/promise';
import { authErrorResponse, requireResourceOwner, requireUser } from '@/app/lib/authz';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ erro: 'id do usuário é obrigatório' }, { status: 400 });
    }
    const user = await requireUser();
    requireResourceOwner(user, id);

    const [usuarios] = await pool.query<RowDataPacket[]>(
      'SELECT u.id_usuario, u.nome, u.email, u.telefone, u.foto_perfil, u.cidade, p.descricao_profissional FROM usuario u LEFT JOIN prestador p ON p.id_usuario = u.id_usuario WHERE u.id_usuario = ?',
      [id]
    );
    if (usuarios.length === 0) return NextResponse.json({ erro: 'Usuário não encontrado' }, { status: 404 });

    const [servicos] = await pool.query<RowDataPacket[]>(
      `SELECT
        s.id_solicitacao AS id,
        CONCAT('Serviço com ', u.nome) AS titulo,
        COALESCE(s.descricao_servico, s.complemento, 'Serviço contratado') AS descricao,
        COALESCE(p.categoria_principal, 'Serviço') AS categoria,
        u.nome AS profissional,
        s.data_solicitacao AS data,
        CASE WHEN s.status = 1 THEN 'Concluido' ELSE 'Avaliar' END AS status,
        u.foto_perfil AS imagemUrl
       FROM solicitacaoservico s
       INNER JOIN usuario u ON u.id_usuario = s.id_prestador
       LEFT JOIN prestador p ON p.id_usuario = s.id_prestador
       WHERE s.id_usuario = ?
       ORDER BY s.data_solicitacao DESC
       LIMIT 10`,
      [id]
    );

    const [avaliacoes] = await pool.query<RowDataPacket[]>(
      'SELECT a.id_avaliacao AS id, u.nome, COALESCE(c.nome_categoria, "Profissional") AS profissao, a.nota, a.data_avaliacao AS data, a.comentario AS texto, u.foto_perfil AS avatarUrl FROM avaliacao a INNER JOIN usuario u ON u.id_usuario = a.id_prestador LEFT JOIN prestador p ON p.id_usuario = a.id_prestador LEFT JOIN categoria c ON c.id_categoria = p.categoria_principal WHERE a.id_usuario = ? ORDER BY a.data_avaliacao DESC LIMIT 5',
      [id]
    );

    const mediaAvaliacoes = avaliacoes.length ? avaliacoes.reduce((soma: number, item: any) => soma + Number(item.nota || 0), 0) / avaliacoes.length : 0;

    return NextResponse.json({
      usuario: usuarios[0],
      servicos: servicos.map((servico: any) => ({ ...servico, data: servico.data ? new Date(servico.data).toLocaleDateString('pt-BR') : '' })),
      avaliacoes: avaliacoes.map((avaliacao: any) => ({ ...avaliacao, data: avaliacao.data ? new Date(avaliacao.data).toLocaleDateString('pt-BR') : '' })),
      mediaAvaliacoes,
      totalContratado: servicos.length,
      sobre: usuarios[0].descricao_profissional || 'Nenhuma descrição informada ainda.',
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    return NextResponse.json({ erro: 'Erro ao carregar perfil' }, { status: 500 });
  }
}
