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

interface DadosNovaMensagemAudio {
  idConversa: number;
  idRemetente: number;
  arquivoUrl: string;
  arquivoPublicId: string;
  arquivoMime: string;
  arquivoTamanho: number;
  audioDuracao: number;
}

interface DadosNovaMensagemAnexo {
  idConversa: number;
  idRemetente: number;
  nomeArquivo: string;
  tipoMensagem: 'imagem' | 'video' | 'documento';
  arquivoUrl: string;
  arquivoPublicId: string;
  arquivoMime: string;
  arquivoTamanho: number;
}

function mensagemParaCliente(mensagem: RowDataPacket) {
  if (mensagem.tipo_mensagem === 'texto' || !mensagem.tipo_mensagem) return mensagem;
  const rotaArquivo =
    mensagem.tipo_mensagem === 'audio'
      ? `/api/mensagens/${mensagem.idMensagem}/audio`
      : `/api/mensagens/${mensagem.idMensagem}/anexo`;
  return {
    ...mensagem,
    arquivo_url: rotaArquivo,
    arquivo_public_id: undefined,
  };
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
    return historico.map(mensagemParaCliente);
  }

  async enviarMensagemAudio(dados: DadosNovaMensagemAudio) {
    const agora = new Date();
    const conexao = await pool.getConnection();

    try {
      await conexao.beginTransaction();
      const [resultado] = await conexao.execute<ResultSetHeader>(
        `INSERT INTO mensagens
          (idConversa, idRemetente, conteudo, criadoEm, lida, tipo_mensagem,
           arquivo_url, arquivo_public_id, arquivo_mime, arquivo_tamanho, audio_duracao)
         VALUES (?, ?, ?, ?, 0, 'audio', ?, ?, ?, ?, ?)`,
        [
          dados.idConversa,
          dados.idRemetente,
          '[Áudio]',
          agora,
          dados.arquivoUrl,
          dados.arquivoPublicId,
          dados.arquivoMime,
          dados.arquivoTamanho,
          dados.audioDuracao,
        ]
      );
      await conexao.execute(
        'UPDATE conversas SET ultimaMensagemEm = ? WHERE idConversa = ?',
        [agora, dados.idConversa]
      );
      await conexao.commit();

      const [conversas] = await pool.execute<RowDataPacket[]>(
        'SELECT idUsuario, idPrestador FROM conversas WHERE idConversa = ?',
        [dados.idConversa]
      );
      const conversa = conversas[0];
      const destinatario =
        Number(conversa?.idUsuario) === dados.idRemetente
          ? Number(conversa?.idPrestador)
          : Number(conversa?.idUsuario);
      if (destinatario && destinatario !== dados.idRemetente) {
        await notificacaoService
          .criar({
            id_usuario: destinatario,
            titulo: 'Nova mensagem de áudio',
            descricao: 'Você recebeu uma mensagem de áudio.',
            url_acao: '/mensagens',
            tipo: 'mensagem',
          })
          .catch(() => undefined);
      }

      return {
        idMensagem: resultado.insertId,
        idConversa: dados.idConversa,
        idRemetente: dados.idRemetente,
        conteudo: '[Áudio]',
        criadoEm: agora,
        lida: false,
        tipo_mensagem: 'audio',
        arquivo_url: `/api/mensagens/${resultado.insertId}/audio`,
        arquivo_mime: dados.arquivoMime,
        arquivo_tamanho: dados.arquivoTamanho,
        audio_duracao: dados.audioDuracao,
      };
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  }

  async buscarAudioPorMensagem(idMensagem: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT m.idMensagem, m.idConversa, m.arquivo_public_id, m.arquivo_mime
       FROM mensagens m
       WHERE m.idMensagem = ? AND m.tipo_mensagem = 'audio'
       LIMIT 1`,
      [idMensagem]
    );
    return rows[0] ?? null;
  }

  async enviarMensagemAnexo(dados: DadosNovaMensagemAnexo) {
    const agora = new Date();
    const conexao = await pool.getConnection();

    try {
      await conexao.beginTransaction();
      const [resultado] = await conexao.execute<ResultSetHeader>(
        `INSERT INTO mensagens
          (idConversa, idRemetente, conteudo, criadoEm, lida, tipo_mensagem,
           arquivo_url, arquivo_public_id, arquivo_mime, arquivo_tamanho)
         VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
        [
          dados.idConversa,
          dados.idRemetente,
          dados.nomeArquivo,
          agora,
          dados.tipoMensagem,
          dados.arquivoUrl,
          dados.arquivoPublicId,
          dados.arquivoMime,
          dados.arquivoTamanho,
        ]
      );
      await conexao.execute(
        'UPDATE conversas SET ultimaMensagemEm = ? WHERE idConversa = ?',
        [agora, dados.idConversa]
      );
      await conexao.commit();

      const [conversas] = await pool.execute<RowDataPacket[]>(
        'SELECT idUsuario, idPrestador FROM conversas WHERE idConversa = ?',
        [dados.idConversa]
      );
      const conversa = conversas[0];
      const destinatario =
        Number(conversa?.idUsuario) === dados.idRemetente
          ? Number(conversa?.idPrestador)
          : Number(conversa?.idUsuario);
      if (destinatario && destinatario !== dados.idRemetente) {
        await notificacaoService
          .criar({
            id_usuario: destinatario,
            titulo: 'Novo anexo no chat',
            descricao: `Você recebeu ${dados.tipoMensagem === 'imagem' ? 'uma imagem' : dados.tipoMensagem === 'video' ? 'um vídeo' : 'um documento'}.`,
            url_acao: '/mensagens',
            tipo: 'mensagem',
          })
          .catch(() => undefined);
      }

      return {
        idMensagem: resultado.insertId,
        idConversa: dados.idConversa,
        idRemetente: dados.idRemetente,
        conteudo: dados.nomeArquivo,
        criadoEm: agora,
        lida: false,
        tipo_mensagem: dados.tipoMensagem,
        arquivo_url: `/api/mensagens/${resultado.insertId}/anexo`,
        arquivo_mime: dados.arquivoMime,
        arquivo_tamanho: dados.arquivoTamanho,
      };
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  }

  async buscarAnexoPorMensagem(idMensagem: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT m.idMensagem, m.idConversa, m.tipo_mensagem, m.arquivo_public_id,
              m.arquivo_mime, m.conteudo
       FROM mensagens m
       WHERE m.idMensagem = ?
         AND m.tipo_mensagem IN ('imagem', 'video', 'documento')
       LIMIT 1`,
      [idMensagem]
    );
    return rows[0] ?? null;
  }

  async listarMensagensDesdeId(idConversa: number, afterId: number, limite = 50) {
    const [historico] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM mensagens
       WHERE idConversa = ? AND idMensagem > ?
       ORDER BY idMensagem ASC
       LIMIT ${limite}`,
      [idConversa, afterId]
    );
    return historico.map(mensagemParaCliente);
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

  return historico.reverse().map(mensagemParaCliente);
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

    return historico.reverse().map(mensagemParaCliente);
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
