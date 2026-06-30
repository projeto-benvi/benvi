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

  async listarConversasPorParticipante(idParticipante: number, tipoParticipante: 'usuario' | 'prestador' | 'admin') {
    let queryListar: string;

    if (tipoParticipante === 'admin') {
      return [];
    } else if (tipoParticipante === 'usuario') {
      queryListar = `
        SELECT
          c.idConversa,
          c.idUsuario,
          c.idPrestador,
          u.nome AS nome,
          u.foto_perfil AS fotoPerfil,
          c.ultimaMensagemEm
        FROM conversas c
        INNER JOIN prestador p ON p.id_usuario = c.idPrestador
        INNER JOIN usuario u ON u.id_usuario = p.id_usuario
        WHERE c.idUsuario = ?
        ORDER BY c.ultimaMensagemEm DESC
      `;
    } else {
      queryListar = `
        SELECT
          c.idConversa,
          c.idUsuario,
          c.idPrestador,
          CASE WHEN c.idPrestador = ? THEN u_cliente.nome ELSE u_prestador.nome END AS nome,
          CASE WHEN c.idPrestador = ? THEN u_cliente.foto_perfil ELSE u_prestador.foto_perfil END AS fotoPerfil,
          c.ultimaMensagemEm
        FROM conversas c
        INNER JOIN usuario u_cliente ON u_cliente.id_usuario = c.idUsuario
        INNER JOIN usuario u_prestador ON u_prestador.id_usuario = c.idPrestador
        WHERE c.idPrestador = ? OR c.idUsuario = ?
        ORDER BY c.ultimaMensagemEm DESC
      `;
    }

    const params = tipoParticipante === 'prestador'
      ? [idParticipante, idParticipante, idParticipante, idParticipante]
      : [idParticipante];
    const [conversas] = await pool.execute<RowDataPacket[]>(queryListar, params);
    return conversas;
  }
}