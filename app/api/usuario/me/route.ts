import { authErrorResponse, requireUser } from '@/app/lib/authz';
import { usuarioService } from '@/service/usuarioService';
import { NextRequest, NextResponse } from 'next/server';

function mapSelfDeletionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  const respostas: Record<string, { erro: string; status: number }> = {
    CONFIRMACAO_INVALIDA: { erro: 'Confirmação inválida.', status: 400 },
    SENHA_OBRIGATORIA: { erro: 'Senha atual obrigatória para esta conta.', status: 400 },
    SENHA_INVALIDA: { erro: 'Senha atual incorreta.', status: 400 },
    USUARIO_NAO_ENCONTRADO: { erro: 'Usuário não encontrado.', status: 404 },
    CONTA_JA_EXCLUIDA: { erro: 'Conta já excluída.', status: 409 },
    ULTIMO_ADMIN: { erro: 'O último administrador ativo não pode excluir a própria conta.', status: 409 },
  };

  if (respostas[message]) {
    return NextResponse.json({ erro: respostas[message].erro }, { status: respostas[message].status });
  }

  console.error('Erro seguro na exclusão da própria conta.', {
    tipo: error instanceof Error ? error.name : typeof error,
    mensagem: message,
  });

  return NextResponse.json({ erro: 'Erro ao excluir conta.' }, { status: 500 });
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));

    await usuarioService.excluirPropriaConta(user.id, {
      fraseConfirmacao: body?.fraseConfirmacao,
      senhaAtual: body?.senhaAtual,
    });

    return NextResponse.json({ mensagem: 'Conta excluída com sucesso.' });
  } catch (error) {
    return authErrorResponse(error) ?? mapSelfDeletionError(error);
  }
}
