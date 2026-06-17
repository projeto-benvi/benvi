// service/mensagemService.ts
import pool from '@/app/lib/dataBase';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

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

      const queryMensagem = `
        INSERT INTO mensagens (idConversa, idRemetente, conteudo, criadoEm) 
        VALUES (?, ?, ?, ?)
      `;
      const [resultadoMensagem] = await conexao.execute<ResultSetHeader>(queryMensagem, [
        idConversa, 
        idRemetente, 
        conteudo, 
        agora
      ]);

      const queryConversa = `
        UPDATE conversas 
        SET ultimaMensagemEm = ? 
        WHERE idConversa = ?
      `;
      await conexao.execute(queryConversa, [agora, idConversa]);

      await conexao.commit();

      return {
        idMensagem: resultadoMensagem.insertId,
        idConversa,
        idRemetente,
        conteudo,
        criadoEm: agora
      };

    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  }

  async listarMensagensPorConversa(idConversa: number) {
    const queryHistorico = `
      SELECT * FROM mensagens 
      WHERE idConversa = ? 
      ORDER BY criadoEm ASC
    `;

    const [historico] = await pool.execute<RowDataPacket[]>(queryHistorico, [idConversa]);
    return historico;
  }
}