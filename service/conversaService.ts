// service/conversaService.ts
import pool from '@/app/lib/dataBase';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface DadosConversa {
  idUsuario: number; 
  idPrestador: number;
}

export class ConversaService {
  
  async buscarOuCriarConversa(dados: DadosConversa) {
    const { idUsuario, idPrestador } = dados;

    const queryBuscar = `
      SELECT * FROM conversas 
      WHERE idUsuario = ? AND idPrestador = ? 
      LIMIT 1
    `;
    
    const [linhas] = await pool.execute<RowDataPacket[]>(queryBuscar, [idUsuario, idPrestador]);

    if (linhas.length > 0) {
      return linhas[0];
    }

    const agora = new Date();
    const queryInserir = `
      INSERT INTO conversas (idUsuario, idPrestador, ultimaMensagemEm) 
      VALUES (?, ?, ?)
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(queryInserir, [idUsuario, idPrestador, agora]);

    return {
      idConversa: resultado.insertId,
      idUsuario,
      idPrestador,
      ultimaMensagemEm: agora
    };
  }

  async listarConversasPorParticipante(idParticipante: number, tipoParticipante: 'usuario' | 'prestador') {
    const colunaFiltro = tipoParticipante === 'usuario' ? 'idUsuario' : 'idPrestador';

    const queryListar = `
      SELECT * FROM conversas 
      WHERE ${colunaFiltro} = ? 
      ORDER BY ultimaMensagemEm DESC
    `;

    const [conversas] = await pool.execute<RowDataPacket[]>(queryListar, [idParticipante]);
    return conversas;
  }
}