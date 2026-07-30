// service/mensagemService.ts
import pool from '@/app/lib/dataBase';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { notificacaoService } from '@/service/notificacaoService';

interface DadosNovaMensagem {
  idConversa: number;
  idRemetente: number;
  conteudo: string;
  clientTempId?: string;
}

export class MensagemService {
  async enviarMensagem(dados: DadosNovaMensagem) {
    const { idConversa, idRemetente, conteudo, clientTempId } = dados;
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

      return {
        idMensagem: resultadoMensagem.insertId,
        idConversa,
        idRemetente,
        conteudo,
        criadoEm: agora,
        lida: false,
        clientTempId,
      };
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

  async listarMensagensDesdeId(idConversa: number, afterId: number, limite = 50) {
    const [historico] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM mensagens
       WHERE idConversa = ? AND idMensagem > ?
       ORDER BY idMensagem ASC
       LIMIT ${limite}`,
      [idConversa, afterId]
    );
    return historico;
  }

  async listarUltimasMensagens(idConversa: number, limite = 30) {
  const [historico] = await pool.query<RowDataPacket[]>(
    `
      SELECT *
      FROM mensagens
      WHERE idConversa = ?
      ORDER BY idMensagem DESC
      LIMIT ${limite}
    `,
    [idConversa]
  );
  
  return historico.reverse();
  }

  async listarMensagensAntes(
    idConversa: number,
    beforeId: number,
    limite = 30
  ) {
    const [historico] = await pool.query<RowDataPacket[]>(
      `
        SELECT *
        FROM mensagens
        WHERE idConversa = ?
        AND idMensagem < ?
        ORDER BY idMensagem DESC
        LIMIT ${limite}
      `,
      [idConversa, beforeId]
    );

    return historico.reverse();
  }

  async marcarComoLidas(
    idConversa: number,
    idUsuario: number
  ) {
    await pool.execute(
      `
        UPDATE mensagens
        SET lida = 1
        WHERE idConversa = ?
        AND idRemetente <> ?
        AND lida = 0
      `,
      [idConversa, idUsuario]
    );
  }
}
