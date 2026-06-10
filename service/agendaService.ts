import pool from '@/app/lib/dataBase';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { AgendaModel } from '@/model/agendaModel';
 
export const AgendaService = {
 
    async listar() {
 
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                a.id_agenda,
                a.horario_inicio,
                a.horario_fim,
                a.status,
                a.titulo,
                a.descricao,
 
                p.id_usuario    AS id_prestador,
                u.nome          AS nome_prestador,
                u.email         AS email_prestador,
                u.telefone      AS telefone_prestador,
                u.foto_perfil   AS foto_prestador,
                p.categoria_principal,
                p.status_verificado,
 
                s.id_solicitacao,
                s.endereco,
                s.data_solicitacao,
                s.data_agendamento,
                s.descricao_servico,
                s.complemento,
 
                u2.id_usuario   AS id_usuario_solicitante,
                u2.nome         AS nome_usuario,
                u2.email        AS email_usuario,
                u2.telefone     AS telefone_usuario,
                u2.foto_perfil  AS foto_usuario
 
            FROM agenda a
 
            INNER JOIN prestador p
                ON a.id_prestador = p.id_usuario
 
            INNER JOIN usuario u
                ON p.id_usuario = u.id_usuario
 
            INNER JOIN solicitacaoservico s
                ON a.id_solicitacao = s.id_solicitacao
 
            INNER JOIN usuario u2
                ON s.id_usuario = u2.id_usuario
 
            ORDER BY a.horario_inicio ASC
            `
        );
 
        return rows.map(row => ({
            id_agenda:      row.id_agenda,
            horario_inicio: row.horario_inicio,
            horario_fim:    row.horario_fim,
            status:         row.status,
            titulo:         row.titulo,
            descricao:      row.descricao,
 
            prestador: {
                id_usuario:          row.id_prestador,
                nome:                row.nome_prestador,
                email:               row.email_prestador,
                telefone:            row.telefone_prestador,
                foto_perfil:         row.foto_prestador,
                categoria_principal: row.categoria_principal,
                status_verificado:   row.status_verificado,
            },
 
            solicitacao: {
                id_solicitacao:    row.id_solicitacao,
                endereco:          row.endereco,
                data_solicitacao:  row.data_solicitacao,
                data_agendamento:  row.data_agendamento,
                descricao_servico: row.descricao_servico,
                complemento:       row.complemento,
 
                usuario: {
                    id_usuario:  row.id_usuario_solicitante,
                    nome:        row.nome_usuario,
                    email:       row.email_usuario,
                    telefone:    row.telefone_usuario,
                    foto_perfil: row.foto_usuario,
                },
            },
        }));
    },
 
    async buscarPorId(id: number) {
 
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                a.id_agenda,
                a.horario_inicio,
                a.horario_fim,
                a.status,
                a.titulo,
                a.descricao,
 
                p.id_usuario    AS id_prestador,
                u.nome          AS nome_prestador,
                u.email         AS email_prestador,
                u.telefone      AS telefone_prestador,
                u.foto_perfil   AS foto_prestador,
                p.categoria_principal,
                p.status_verificado,
 
                s.id_solicitacao,
                s.endereco,
                s.data_solicitacao,
                s.data_agendamento,
                s.descricao_servico,
                s.complemento,
 
                u2.id_usuario   AS id_usuario_solicitante,
                u2.nome         AS nome_usuario,
                u2.email        AS email_usuario,
                u2.telefone     AS telefone_usuario,
                u2.foto_perfil  AS foto_usuario
 
            FROM agenda a
 
            INNER JOIN prestador p
                ON a.id_prestador = p.id_usuario
 
            INNER JOIN usuario u
                ON p.id_usuario = u.id_usuario
 
            INNER JOIN solicitacaoservico s
                ON a.id_solicitacao = s.id_solicitacao
 
            INNER JOIN usuario u2
                ON s.id_usuario = u2.id_usuario
 
            WHERE a.id_agenda = ?
            `,
            [id]
        );
 
        if (rows.length === 0) {
            throw new Error('Agenda não encontrada');
        }
 
        const row = rows[0];
 
        return {
            id_agenda:      row.id_agenda,
            horario_inicio: row.horario_inicio,
            horario_fim:    row.horario_fim,
            status:         row.status,
            titulo:         row.titulo,
            descricao:      row.descricao,
 
            prestador: {
                id_usuario:           row.id_prestador,
                nome:                 row.nome_prestador,
                email:                row.email_prestador,
                telefone:             row.telefone_prestador,
                foto_perfil:          row.foto_prestador,
                categoria_principal:  row.categoria_principal,
                status_verificado:    row.status_verificado,
            },
 
            solicitacao: {
                id_solicitacao:   row.id_solicitacao,
                endereco:         row.endereco,
                data_solicitacao: row.data_solicitacao,
                data_agendamento: row.data_agendamento,
                descricao_servico: row.descricao_servico,
                complemento:      row.complemento,
 
                usuario: {
                    id_usuario:  row.id_usuario_solicitante,
                    nome:        row.nome_usuario,
                    email:       row.email_usuario,
                    telefone:    row.telefone_usuario,
                    foto_perfil: row.foto_usuario,
                },
            },
        };
    },
 
    async listarPorPrestador(id_prestador: number) {
 
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                a.*,
                s.endereco,
                s.descricao_servico,
                u.nome          AS nome_usuario,
                u.foto_perfil   AS foto_usuario,
                u.telefone      AS telefone_usuario
            FROM agenda a
            INNER JOIN solicitacaoservico s
                ON a.id_solicitacao = s.id_solicitacao
            INNER JOIN usuario u
                ON s.id_usuario = u.id_usuario
            WHERE a.id_prestador = ?
            ORDER BY a.horario_inicio ASC
            `,
            [id_prestador]
        );
 
        return rows;
    },
 
    async listarPorSolicitacao(id_solicitacao: number) {
 
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                a.*,
                u.nome          AS nome_prestador,
                u.foto_perfil   AS foto_prestador,
                p.categoria_principal
            FROM agenda a
            INNER JOIN prestador p
                ON a.id_prestador = p.id_usuario
            INNER JOIN usuario u
                ON p.id_usuario = u.id_usuario
            WHERE a.id_solicitacao = ?
            ORDER BY a.horario_inicio ASC
            `,
            [id_solicitacao]
        );
 
        return rows;
    },
 
    async criar(dados: {
        id_prestador: number;
        id_solicitacao: number;
        horario_inicio: Date;
        horario_fim: Date;
        status?: string;
        titulo: string;
        descricao?: string;
    }): Promise<number> {
 
        const [prestador] = await pool.query<RowDataPacket[]>(
            `SELECT id_usuario FROM prestador WHERE id_usuario = ?`,
            [dados.id_prestador]
        );
        if (prestador.length === 0) {
            throw new Error('Prestador não encontrado');
        }
 
        const [solicitacao] = await pool.query<RowDataPacket[]>(
            `SELECT id_solicitacao FROM solicitacaoservico WHERE id_solicitacao = ?`,
            [dados.id_solicitacao]
        );
        if (solicitacao.length === 0) {
            throw new Error('Solicitação de serviço não encontrada');
        }
 
        const agenda = new AgendaModel(
            dados.id_prestador,
            dados.id_solicitacao,
            new Date(dados.horario_inicio),
            new Date(dados.horario_fim),
            dados.status ?? 'pendente',
            dados.titulo,
            dados.descricao ?? ''
        );
 
        if (!agenda.validarHorarios()) {
            throw new Error('O horário de início deve ser anterior ao horário de fim');
        }
 
        if (agenda.tituloVazio()) {
            throw new Error('O título não pode ser vazio');
        }
 
        if (!agenda.statusValido()) {
            throw new Error('Status inválido. Use: pendente, confirmado, cancelado ou concluido');
        }
 
        const [result] = await pool.query<ResultSetHeader>(
            `
            INSERT INTO agenda
                (id_prestador, id_solicitacao, horario_inicio, horario_fim, status, titulo, descricao)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                agenda.id_prestador,
                agenda.id_solicitacao,
                agenda.horario_inicio,
                agenda.horario_fim,
                agenda.status,
                agenda.titulo,
                agenda.descricao,
            ]
        );
 
        return result.insertId;
    },
 
    async atualizar(id: number, dados: Partial<AgendaModel>): Promise<void> {
 
        const camposPermitidos = [
            'horario_inicio',
            'horario_fim',
            'status',
            'titulo',
            'descricao',
        ];
 
        const setClauses: string[] = [];
        const valores: any[] = [];
 
        camposPermitidos.forEach(campo => {
            if (dados[campo as keyof Partial<AgendaModel>] !== undefined) {
                setClauses.push(`${campo} = ?`);
                valores.push(dados[campo as keyof Partial<AgendaModel>]);
            }
        });
 
        if (setClauses.length === 0) return;
 
        if (dados.status) {
            const statusPermitidos = ['pendente', 'confirmado', 'cancelado', 'concluido'];
            if (!statusPermitidos.includes(dados.status)) {
                throw new Error('Status inválido. Use: pendente, confirmado, cancelado ou concluido');
            }
        }
 
        if (dados.horario_inicio && dados.horario_fim) {
            if (new Date(dados.horario_inicio) >= new Date(dados.horario_fim)) {
                throw new Error('O horário de início deve ser anterior ao horário de fim');
            }
        }
 
        valores.push(id);
 
        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE agenda SET ${setClauses.join(', ')} WHERE id_agenda = ?`,
            valores
        );
 
        if (result.affectedRows === 0) {
            throw new Error('Agenda não encontrada');
        }
    },
 
    async remover(id: number): Promise<boolean> {
 
        const [result] = await pool.query<ResultSetHeader>(
            `DELETE FROM agenda WHERE id_agenda = ?`,
            [id]
        );
 
        return result.affectedRows > 0;
    },
};