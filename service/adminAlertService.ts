import pool from '@/app/lib/dataBase';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export type PublicoAlvoAlerta = 'todos' | 'clientes' | 'prestadores';
export type TipoAlertaMassa = 'informativo' | 'aviso' | 'importante' | 'urgente';

export type CriarAlertaMassaInput = {
  titulo: string;
  mensagem: string;
  tipo: TipoAlertaMassa;
  publicoAlvo: PublicoAlvoAlerta;
  urlAcao?: string | null;
};

export class AdminAlertError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'AdminAlertError';
    this.status = status;
  }
}

const MAX_DESTINATARIOS_ENVIO_IMEDIATO = 1000;
const CHUNK_SIZE = 200;
const tiposPermitidos = new Set<TipoAlertaMassa>(['informativo', 'aviso', 'importante', 'urgente']);
const publicosPermitidos = new Set<PublicoAlvoAlerta>(['todos', 'clientes', 'prestadores']);

function rejeitarHtmlInseguro(valor: string, campo: string) {
  if (/[<>]/.test(valor)) {
    throw new AdminAlertError(`${campo} nao pode conter HTML.`);
  }
}

function normalizarTexto(valor: unknown, campo: string, max: number) {
  if (typeof valor !== 'string') throw new AdminAlertError(`${campo} invalido.`);
  const texto = valor.trim().replace(/\s+/g, ' ');
  if (!texto) throw new AdminAlertError(`${campo} obrigatorio.`);
  if (texto.length > max) throw new AdminAlertError(`${campo} excede o limite de caracteres.`);
  rejeitarHtmlInseguro(texto, campo);
  return texto;
}

function normalizarUrl(valor: unknown) {
  if (valor === undefined || valor === null || valor === '') return null;
  if (typeof valor !== 'string') throw new AdminAlertError('Link invalido.');
  const url = valor.trim();
  if (!url) return null;
  if (url.length > 255) throw new AdminAlertError('Link excede o limite de caracteres.');
  rejeitarHtmlInseguro(url, 'Link');
  if (!url.startsWith('/') || url.startsWith('//')) {
    throw new AdminAlertError('Use apenas links internos da plataforma.');
  }
  return url;
}

export function validarAlertaMassaInput(body: any): CriarAlertaMassaInput {
  const tipo = body?.tipo;
  const publicoAlvo = body?.publicoAlvo ?? body?.publico_alvo;

  if (!tiposPermitidos.has(tipo)) throw new AdminAlertError('Tipo de alerta invalido.');
  if (!publicosPermitidos.has(publicoAlvo)) throw new AdminAlertError('Publico-alvo invalido.');

  return {
    titulo: normalizarTexto(body?.titulo, 'Titulo', 160),
    mensagem: normalizarTexto(body?.mensagem, 'Mensagem', 1000),
    tipo,
    publicoAlvo,
    urlAcao: normalizarUrl(body?.urlAcao ?? body?.url_acao),
  };
}

function queryDestinatarios(publicoAlvo: PublicoAlvoAlerta) {
  const baseWhere = "u.status_conta = 'ativo' AND u.deleted_at IS NULL";

  if (publicoAlvo === 'prestadores') {
    return `
      SELECT DISTINCT u.id_usuario
        FROM usuario u
        INNER JOIN prestador p ON p.id_usuario = u.id_usuario
       WHERE ${baseWhere}
         AND COALESCE(p.status_social, 'ativo') = 'ativo'
    `;
  }

  if (publicoAlvo === 'clientes') {
    return `
      SELECT DISTINCT u.id_usuario
        FROM usuario u
       WHERE ${baseWhere}
         AND NOT EXISTS (
           SELECT 1 FROM prestador p WHERE p.id_usuario = u.id_usuario
         )
    `;
  }

  return `
    SELECT DISTINCT u.id_usuario
      FROM usuario u
     WHERE ${baseWhere}
  `;
}

export const adminAlertService = {
  async estimarDestinatarios(publicoAlvo: PublicoAlvoAlerta) {
    if (!publicosPermitidos.has(publicoAlvo)) throw new AdminAlertError('Publico-alvo invalido.');

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM (${queryDestinatarios(publicoAlvo)}) destinatarios`
    );
    return Number(rows[0]?.total ?? 0);
  },

  async enviarAlertaMassa(idAdmin: number, input: CriarAlertaMassaInput) {
    const [destinatarios] = await pool.query<RowDataPacket[]>(queryDestinatarios(input.publicoAlvo));
    const ids = destinatarios.map((row) => Number(row.id_usuario)).filter((id) => Number.isInteger(id) && id > 0);

    if (ids.length === 0) {
      throw new AdminAlertError('Nenhum destinatario ativo encontrado.', 404);
    }

    if (ids.length > MAX_DESTINATARIOS_ENVIO_IMEDIATO) {
      throw new AdminAlertError('Publico muito grande para envio imediato. Use fila/worker para este volume.', 409);
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [envioResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO alerta_envio
          (id_admin, titulo, mensagem, tipo, publico_alvo, url_acao, total_destinatarios)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [idAdmin, input.titulo, input.mensagem, input.tipo, input.publicoAlvo, input.urlAcao, ids.length]
      );

      for (let index = 0; index < ids.length; index += CHUNK_SIZE) {
        const chunk = ids.slice(index, index + CHUNK_SIZE);
        const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const values = chunk.flatMap((idUsuario) => [
          idUsuario,
          input.titulo,
          input.mensagem,
          input.urlAcao ?? '/notificacoes',
          `alerta:${input.tipo}`,
          envioResult.insertId,
        ]);

        await connection.query(
          `INSERT INTO notificacao (id_usuario, titulo, descricao, url_acao, tipo, id_alerta_envio)
           VALUES ${placeholders}`,
          values
        );
      }

      await connection.query(
        'INSERT INTO admin_auditoria (id_admin, id_usuario_afetado, acao) VALUES (?, ?, ?)',
        [idAdmin, null, `enviar_alerta_${input.publicoAlvo}_${input.tipo}`]
      );

      await connection.commit();

      return {
        id_alerta_envio: envioResult.insertId,
        total_destinatarios: ids.length,
      };
    } catch (error) {
      await connection.rollback();
      const err = error as { name?: string; code?: string; message?: string };
      console.error('Erro seguro ao enviar alerta em massa.', {
        tipo: err?.name ?? typeof error,
        codigo: err?.code,
        mensagem: err?.message,
        publicoAlvo: input.publicoAlvo,
      });
      throw error;
    } finally {
      connection.release();
    }
  },
};
