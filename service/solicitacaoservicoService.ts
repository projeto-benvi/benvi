// service/solicitacaoservicoService.ts

import pool from '@/app/lib/dataBase';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { SolicitacaoServico } from '@/model/solicitacaoservico';

export const SolicitacaoServicoService = {

    async listar() {
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                s.id_solicitacao,
                s.endereco,
                s.data_solicitacao,
                s.data_agendamento,
                s.status,
                s.descricao_servico,
                s.complemento,

                u.id_usuario,
                u.nome        AS nome_usuario,
                u.email       AS email_usuario,
                u.telefone    AS telefone_usuario,
                u.foto_perfil AS foto_usuario,

                p.id_usuario  AS id_prestador,
                u2.nome       AS nome_prestador,
                u2.email      AS email_prestador,
                p.categoria_principal,
                p.status_social

            FROM solicitacaoservico s

            INNER JOIN usuario u
                ON s.id_usuario = u.id_usuario

            INNER JOIN prestador p
                ON s.id_prestador = p.id_usuario

            INNER JOIN usuario u2
                ON p.id_usuario = u2.id_usuario

            ORDER BY s.data_solicitacao DESC
            `
        );
        return rows;
    },

    async buscarPorId(id: number) {
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                s.id_solicitacao,
                s.endereco,
                s.data_solicitacao,
                s.data_agendamento,
                s.status,
                s.descricao_servico,
                s.complemento,

                u.id_usuario,
                u.nome        AS nome_usuario,
                u.email       AS email_usuario,
                u.telefone    AS telefone_usuario,
                u.foto_perfil AS foto_usuario,
                u.cidade      AS cidade_usuario,

                p.id_usuario  AS id_prestador,
                u2.nome       AS nome_prestador,
                u2.email      AS email_prestador,
                u2.foto_perfil AS foto_prestador,
                p.descricao_profissional,
                p.categoria_principal,
                p.status_verificado,
                p.status_social

            FROM solicitacaoservico s

            INNER JOIN usuario u
                ON s.id_usuario = u.id_usuario

            INNER JOIN prestador p
                ON s.id_prestador = p.id_usuario

            INNER JOIN usuario u2
                ON p.id_usuario = u2.id_usuario

            WHERE s.id_solicitacao = ?
            `,
            [id]
        );

        if (rows.length === 0) {
            throw new Error('Solicitação não encontrada');
        }

        const row = rows[0];

        return {
            id_solicitacao:   row.id_solicitacao,
            endereco:         row.endereco,
            data_solicitacao: row.data_solicitacao,
            data_agendamento: row.data_agendamento,
            status:           row.status,
            descricao_servico: row.descricao_servico,
            complemento:      row.complemento,

            usuario: {
                id_usuario:  row.id_usuario,
                nome:        row.nome_usuario,
                email:       row.email_usuario,
                telefone:    row.telefone_usuario,
                foto_perfil: row.foto_usuario,
                cidade:      row.cidade_usuario,
            },

            prestador: {
                id_usuario:             row.id_prestador,
                nome:                   row.nome_prestador,
                email:                  row.email_prestador,
                foto_perfil:            row.foto_prestador,
                descricao_profissional: row.descricao_profissional,
                categoria_principal:    row.categoria_principal,
                status_verificado:      row.status_verificado,
                status_social:          row.status_social,
            },
        };
    },

    async listarPorUsuario(id_usuario: number) {
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                s.*,
                u2.nome       AS nome_prestador,
                u2.foto_perfil AS foto_prestador,
                p.categoria_principal
            FROM solicitacaoservico s
            INNER JOIN prestador p   ON s.id_prestador = p.id_usuario
            INNER JOIN usuario u2    ON p.id_usuario   = u2.id_usuario
            WHERE s.id_usuario = ?
            ORDER BY s.data_solicitacao DESC
            `,
            [id_usuario]
        );
        return rows;
    },

    async listarPorPrestador(id_prestador: number) {
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                s.*,
                u.nome        AS nome_usuario,
                u.foto_perfil AS foto_usuario,
                u.telefone    AS telefone_usuario
            FROM solicitacaoservico s
            INNER JOIN usuario u ON s.id_usuario = u.id_usuario
            WHERE s.id_prestador = ?
            ORDER BY s.data_solicitacao DESC
            `,
            [id_prestador]
        );
        return rows;
    },

    async criar(dados: {
        id_usuario: number;
        id_prestador: number;
        id_agenda?: number;
        endereco?: string;
        data_agendamento?: Date;
        descricao_servico?: string;
        complemento: string;
    }): Promise<number> {

        const [usuario] = await pool.query<RowDataPacket[]>(
            `SELECT id_usuario FROM usuario WHERE id_usuario = ?`,
            [dados.id_usuario]
        );
        if (usuario.length === 0) {
            throw new Error('Usuário não encontrado');
        }

        const [prestador] = await pool.query<RowDataPacket[]>(
            `SELECT id_usuario FROM prestador WHERE id_usuario = ?`,
            [dados.id_prestador]
        );
        if (prestador.length === 0) {
            throw new Error('Prestador não encontrado');
        }

        if (dados.id_usuario === dados.id_prestador) {
            throw new Error('Um prestador não pode solicitar serviço a si mesmo');
        }

        const solicitacao = new SolicitacaoServico(dados);

        const [result] = await pool.query<ResultSetHeader>(
            `
            INSERT INTO solicitacaoservico
                (id_usuario, id_prestador, id_agenda, endereco, data_solicitacao,
                 data_agendamento, status, descricao_servico, complemento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                solicitacao.id_usuario,
                solicitacao.id_prestador,
                
                solicitacao.endereco ?? null,
                solicitacao.data_solicitacao,
                solicitacao.data_agendamento ?? null,
                solicitacao.status ? 1 : 0,
                solicitacao.descricao_servico ?? null,
                solicitacao.complemento,
            ]
        );

        return result.insertId;
    },

    async atualizar(id: number, dados: Partial<SolicitacaoServico>): Promise<void> {
        const camposPermitidos = [
            'endereco',
            'data_agendamento',
            'status',
            'descricao_servico',
            'complemento',
        ];

        const setClauses: string[] = [];
        const valores: any[] = [];

        camposPermitidos.forEach(campo => {
            if (dados[campo as keyof Partial<SolicitacaoServico>] !== undefined) {
                setClauses.push(`${campo} = ?`);
                valores.push(dados[campo as keyof Partial<SolicitacaoServico>]);
            }
        });

        if (setClauses.length === 0) return;

        valores.push(id);

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE solicitacaoservico SET ${setClauses.join(', ')} WHERE id_solicitacao = ?`,
            valores
        );

        if (result.affectedRows === 0) {
            throw new Error('Solicitação não encontrada');
        }
    },

    async remover(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            `DELETE FROM solicitacaoservico WHERE id_solicitacao = ?`,
            [id]
        );
        return result.affectedRows > 0;
    },
};
