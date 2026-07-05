import pool from '@/app/lib/dataBase';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { AgendaModel } from '@/model/agendaModel';
import { notificacaoService } from '@/service/notificacaoService';

function consultaBase(where = '') {
  return 'SELECT a.*, ' +
    'u_prestador.nome AS nome_prestador, u_prestador.foto_perfil AS foto_prestador, ' +
    's.endereco, s.descricao_servico, s.data_agendamento, s.complemento, s.id_usuario AS id_usuario, ' +
    'u_cliente.nome AS nome_usuario, u_cliente.foto_perfil AS foto_usuario, u_cliente.telefone AS telefone_usuario ' +
    'FROM agenda a ' +
    'LEFT JOIN prestador p ON a.id_prestador = p.id_usuario ' +
    'LEFT JOIN usuario u_prestador ON p.id_usuario = u_prestador.id_usuario ' +
    'LEFT JOIN solicitacaoservico s ON a.id_solicitacao = s.id_solicitacao ' +
    'LEFT JOIN usuario u_cliente ON s.id_usuario = u_cliente.id_usuario ' +
    where + ' ORDER BY a.horario_inicio ASC';
}

async function validarConflito(idPrestador: number, inicio: Date, fim: Date, ignorarId?: number) {
  const valores: any[] = [idPrestador, fim, inicio];
  let sql = "SELECT id_agenda FROM agenda WHERE id_prestador = ? AND status <> 'cancelado' AND horario_inicio < ? AND horario_fim > ?";
  if (ignorarId) {
    sql += ' AND id_agenda <> ?';
    valores.push(ignorarId);
  }
  const [rows] = await pool.query<RowDataPacket[]>(sql, valores);
  if (rows.length > 0) throw new Error('Já existe um agendamento nesse horário.');
}

export const AgendaService = {
  async listar() {
    const [rows] = await pool.query<RowDataPacket[]>(consultaBase());
    return rows;
  },

  async buscarPorId(id: number) {
    const [rows] = await pool.query<RowDataPacket[]>(consultaBase('WHERE a.id_agenda = ?'), [id]);
    if (rows.length === 0) throw new Error('Agenda não encontrada');
    return rows[0];
  },

  async listarPorPrestador(id_prestador: number) {
    const [rows] = await pool.query<RowDataPacket[]>(consultaBase('WHERE a.id_prestador = ?'), [id_prestador]);
    return rows;
  },

  async listarPorSolicitacao(id_solicitacao: number) {
    const [rows] = await pool.query<RowDataPacket[]>(consultaBase('WHERE a.id_solicitacao = ?'), [id_solicitacao]);
    return rows;
  },

  async criar(dados: {
    id_prestador: number;
    id_solicitacao?: number | null;
    horario_inicio: Date;
    horario_fim: Date;
    status?: string;
    titulo: string;
    descricao?: string;
  }): Promise<number> {
    const inicio = new Date(dados.horario_inicio);
    const fim = new Date(dados.horario_fim);
    const agora = new Date();

    const agenda = new AgendaModel(dados.id_prestador, dados.id_solicitacao ?? null, inicio, fim, dados.status ?? 'pendente', dados.titulo, dados.descricao ?? '');
    if (!agenda.validarHorarios()) throw new Error('O horário de início deve ser anterior ao horário de fim');
    if (inicio < agora) throw new Error('Não é possível criar agendamento em data ou horário passado');
    if (agenda.tituloVazio()) throw new Error('O título não pode ser vazio');
    if (!agenda.statusValido()) throw new Error('Status inválido. Use: pendente, confirmado, cancelado ou concluido');

    const [prestador] = await pool.query<RowDataPacket[]>('SELECT id_usuario FROM prestador WHERE id_usuario = ?', [dados.id_prestador]);
    if (prestador.length === 0) throw new Error('Prestador não encontrado');

    let idUsuarioCliente: number | null = null;
    if (dados.id_solicitacao) {
      const [solicitacao] = await pool.query<RowDataPacket[]>('SELECT id_solicitacao, id_usuario FROM solicitacaoservico WHERE id_solicitacao = ?', [dados.id_solicitacao]);
      if (solicitacao.length === 0) throw new Error('Solicitação de serviço não encontrada');
      idUsuarioCliente = Number(solicitacao[0].id_usuario);
    }

    await validarConflito(dados.id_prestador, inicio, fim);

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO agenda (id_prestador, id_solicitacao, horario_inicio, horario_fim, status, titulo, descricao) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [agenda.id_prestador, agenda.id_solicitacao, agenda.horario_inicio, agenda.horario_fim, agenda.status, agenda.titulo, agenda.descricao]
    );

    await notificacaoService.criar({
      id_usuario: dados.id_prestador,
      titulo: 'Novo agendamento',
      descricao: 'Você tem um novo agendamento: ' + agenda.titulo,
      url_acao: '/agendaPrestador',
      tipo: 'agenda',
    });

    if (idUsuarioCliente) {
      await notificacaoService.criar({
        id_usuario: idUsuarioCliente,
        titulo: 'Agendamento criado',
        descricao: 'Seu serviço foi agendado: ' + agenda.titulo,
        url_acao: '/pedidos',
        tipo: 'agenda',
      });
    }

    return result.insertId;
  },

  async atualizar(id: number, dados: Partial<AgendaModel>): Promise<void> {
    const atual = await this.buscarPorId(id);
    const inicio = dados.horario_inicio ? new Date(dados.horario_inicio) : new Date(atual.horario_inicio);
    const fim = dados.horario_fim ? new Date(dados.horario_fim) : new Date(atual.horario_fim);

    if (inicio >= fim) throw new Error('O horário de início deve ser anterior ao horário de fim');
    if (dados.horario_inicio && inicio < new Date()) throw new Error('Não é possível reagendar para data ou horário passado');
    await validarConflito(Number(atual.id_prestador), inicio, fim, id);

    const camposPermitidos = ['horario_inicio', 'horario_fim', 'status', 'titulo', 'descricao'];
    const setClauses: string[] = [];
    const valores: any[] = [];
    camposPermitidos.forEach(campo => {
      if (dados[campo as keyof Partial<AgendaModel>] !== undefined) {
        setClauses.push(campo + ' = ?');
        valores.push(dados[campo as keyof Partial<AgendaModel>]);
      }
    });
    if (setClauses.length === 0) return;
    if (dados.status && !['pendente', 'confirmado', 'cancelado', 'concluido'].includes(dados.status)) {
      throw new Error('Status inválido. Use: pendente, confirmado, cancelado ou concluido');
    }
    valores.push(id);
    const [result] = await pool.query<ResultSetHeader>('UPDATE agenda SET ' + setClauses.join(', ') + ' WHERE id_agenda = ?', valores);
    if (result.affectedRows === 0) throw new Error('Agenda não encontrada');

    if (atual.id_usuario) {
      await notificacaoService.criar({
        id_usuario: Number(atual.id_usuario),
        titulo: 'Agendamento atualizado',
        descricao: 'O agendamento "' + (dados.titulo || atual.titulo) + '" foi atualizado.',
        url_acao: '/pedidos',
        tipo: 'agenda',
      });
    }
  },

  async remover(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM agenda WHERE id_agenda = ?', [id]);
    return result.affectedRows > 0;
  },
};
