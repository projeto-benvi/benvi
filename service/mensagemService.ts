// service/mensagemService.ts
import pool from '@/app/lib/dataBase';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { notificacaoService } from '@/service/notificacaoService';

interface DadosNovaMensagem {
  idConversa: number;
  idRemetente: number;
  conteudo: string;
}

export class MensagemService {
  async enviarMensagem(dados: DadosNovaMensagem) {
    const { idConversa, idRemetente, conteudo } = dados;
    const agora = new Date();
    const conexao = await pool.getConnection();

    try {
      await conexao.beginTransaction();
      const [resultadoMensagem] = await conexao.execute<ResultSetHeader>(
        'INSERT INTO mensagens (idConversa, idRemetente, conteudo, criadoEm, lida) VALUES (?, ?, ?, ?, ?)',
        [idConversa, idRemetente, conteudo, agora, 0]
      );
      await conexao.execute('UPDATE conversas SET ultimaMensagemEm = ? WHERE idConversa = ?', [agora, idConversa]);
      await conexao.commit();

      const [conversas] = await pool.execute<RowDataPacket[]>('SELECT idUsuario, idPrestador FROM conversas WHERE idConversa = ?', [idConversa]);
      const conversa = conversas[0];
      if (conversa) {
        const destinatario = Number(conversa.idUsuario) === idRemetente ? Number(conversa.idPrestador) : Number(conversa.idUsuario);
        if (destinatario && destinatario !== idRemetente) {
          await notificacaoService.criar({
            id_usuario: destinatario,
            titulo: 'Nova mensagem',
            descricao: conteudo.length > 80 ? conteudo.slice(0, 77) + '...' : conteudo,
            url_acao: '/mensagens',
            tipo: 'mensagem',
          });
        }
      }

      return { idMensagem: resultadoMensagem.insertId, idConversa, idRemetente, conteudo, criadoEm: agora, lida: false };
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  }

  async listarMensagensPorConversa(idConversa: number) {
    const [historico] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM mensagens WHERE idConversa = ? ORDER BY criadoEm ASC',
      [idConversa]
    );
    return historico;
  }
}
