import pool from '@/app/lib/dataBase';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ReporteModel } from '@/model/reporteModel';

export const ReporteService = {

    async listar() {
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                r.id_reporte,
                r.assunto,
                r.arquivo,
                r.tipo_problema,
                r.descricao,
                r.status,
                r.data_reporte,

                u1.id_usuario   AS id_usuario_reportou,
                u1.nome         AS nome_reportou,
                u1.email        AS email_reportou,
                u1.foto_perfil  AS foto_reportou,

                u2.id_usuario   AS id_usuario_reportado,
                u2.nome         AS nome_reportado,
                u2.email        AS email_reportado,
                u2.foto_perfil  AS foto_reportado,

                adm.id_usuario  AS id_admin,
                adm.nome        AS nome_admin

            FROM reporte r

            INNER JOIN usuario u1
                ON r.id_usuario_reportou = u1.id_usuario

            INNER JOIN usuario u2
                ON r.id_usuario_reportado = u2.id_usuario

            LEFT JOIN usuario adm
                ON r.id_admin = adm.id_usuario

            ORDER BY r.data_reporte DESC
            `
        );

        return rows.map(row => ({
            id_reporte:   row.id_reporte,
            assunto:      row.assunto,
            arquivo:      row.arquivo,
            tipo_problema: row.tipo_problema,
            descricao:    row.descricao,
            status:       row.status,
            data_reporte: row.data_reporte,

            usuario_reportou: {
                id_usuario:  row.id_usuario_reportou,
                nome:        row.nome_reportou,
                email:       row.email_reportou,
                foto_perfil: row.foto_reportou,
            },

            usuario_reportado: {
                id_usuario:  row.id_usuario_reportado,
                nome:        row.nome_reportado,
                email:       row.email_reportado,
                foto_perfil: row.foto_reportado,
            },

            admin: row.id_admin ? {
                id_usuario: row.id_admin,
                nome:       row.nome_admin,
            } : null,
        }));
    },

    async buscarPorId(id: number) {
        if (!id || isNaN(id)) throw new Error('ID inválido');

        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                r.id_reporte,
                r.assunto,
                r.arquivo,
                r.tipo_problema,
                r.descricao,
                r.status,
                r.data_reporte,

                u1.id_usuario   AS id_usuario_reportou,
                u1.nome         AS nome_reportou,
                u1.email        AS email_reportou,
                u1.foto_perfil  AS foto_reportou,
                u1.cidade       AS cidade_reportou,

                u2.id_usuario   AS id_usuario_reportado,
                u2.nome         AS nome_reportado,
                u2.email        AS email_reportado,
                u2.foto_perfil  AS foto_reportado,
                u2.cidade       AS cidade_reportado,

                adm.id_usuario  AS id_admin,
                adm.nome        AS nome_admin,
                adm.email       AS email_admin

            FROM reporte r

            INNER JOIN usuario u1
                ON r.id_usuario_reportou = u1.id_usuario

            INNER JOIN usuario u2
                ON r.id_usuario_reportado = u2.id_usuario

            LEFT JOIN usuario adm
                ON r.id_admin = adm.id_usuario

            WHERE r.id_reporte = ?
            `,
            [id]
        );

        if (rows.length === 0) throw new Error('Reporte não encontrado');

        const row = rows[0];

        return {
            id_reporte:    row.id_reporte,
            assunto:       row.assunto,
            arquivo:       row.arquivo,
            tipo_problema: row.tipo_problema,
            descricao:     row.descricao,
            status:        row.status,
            data_reporte:  row.data_reporte,

            usuario_reportou: {
                id_usuario:  row.id_usuario_reportou,
                nome:        row.nome_reportou,
                email:       row.email_reportou,
                foto_perfil: row.foto_reportou,
                cidade:      row.cidade_reportou,
            },

            usuario_reportado: {
                id_usuario:  row.id_usuario_reportado,
                nome:        row.nome_reportado,
                email:       row.email_reportado,
                foto_perfil: row.foto_reportado,
                cidade:      row.cidade_reportado,
            },

            admin: row.id_admin ? {
                id_usuario: row.id_admin,
                nome:       row.nome_admin,
                email:      row.email_admin,
            } : null,
        };
    },

    // Reportes feitos por um usuário
    async listarPorReportou(id_usuario: number) {
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                r.*,
                u2.nome         AS nome_reportado,
                u2.foto_perfil  AS foto_reportado
            FROM reporte r
            INNER JOIN usuario u2 ON r.id_usuario_reportado = u2.id_usuario
            WHERE r.id_usuario_reportou = ?
            ORDER BY r.data_reporte DESC
            `,
            [id_usuario]
        );
        return rows;
    },

    // Reportes recebidos por um usuário
    async listarPorReportado(id_usuario: number) {
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                r.*,
                u1.nome         AS nome_reportou,
                u1.foto_perfil  AS foto_reportou
            FROM reporte r
            INNER JOIN usuario u1 ON r.id_usuario_reportou = u1.id_usuario
            WHERE r.id_usuario_reportado = ?
            ORDER BY r.data_reporte DESC
            `,
            [id_usuario]
        );
        return rows;
    },

    // Reportes por status (para o admin filtrar)
    async listarPorStatus(status: string) {
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                r.*,
                u1.nome         AS nome_reportou,
                u2.nome         AS nome_reportado
            FROM reporte r
            INNER JOIN usuario u1 ON r.id_usuario_reportou  = u1.id_usuario
            INNER JOIN usuario u2 ON r.id_usuario_reportado = u2.id_usuario
            WHERE r.status = ?
            ORDER BY r.data_reporte DESC
            `,
            [status]
        );
        return rows;
    },

    async criar(dados: {
        id_usuario_reportou: number;
        id_usuario_reportado: number;
        assunto: string;
        arquivo?: string;
        tipo_problema: string;
        descricao: string;
    }): Promise<number> {

        // Valida existência de quem reporta
        const [reportou] = await pool.query<RowDataPacket[]>(
            `SELECT id_usuario FROM usuario WHERE id_usuario = ?`,
            [dados.id_usuario_reportou]
        );
        if (reportou.length === 0) throw new Error('Usuário que reportou não encontrado');

        // Valida existência de quem é reportado
        const [reportado] = await pool.query<RowDataPacket[]>(
            `SELECT id_usuario FROM usuario WHERE id_usuario = ?`,
            [dados.id_usuario_reportado]
        );
        if (reportado.length === 0) throw new Error('Usuário reportado não encontrado');

        // Usuário não pode se reportar
        if (dados.id_usuario_reportou === dados.id_usuario_reportado) {
            throw new Error('Um usuário não pode reportar a si mesmo');
        }

        const reporte = new ReporteModel(dados);

        if (!reporte.tipoValido()) {
            throw new Error(
                'Tipo de problema inválido. Use: comportamento_inapropriado, fraude, spam, servico_nao_realizado, dados_falsos ou outro'
            );
        }

        const [result] = await pool.query<ResultSetHeader>(
            `
            INSERT INTO reporte
                (id_usuario_reportou, id_usuario_reportado, assunto,
                 arquivo, tipo_problema, descricao, status, data_reporte)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                reporte.id_usuario_reportou,
                reporte.id_usuario_reportado,
                reporte.assunto,
                reporte.arquivo ?? null,
                reporte.tipo_problema,
                reporte.descricao,
                reporte.status,
                reporte.data_reporte,
            ]
        );

        return result.insertId;
    },

    async atualizar(id: number, dados: Partial<ReporteModel>): Promise<void> {
        const camposPermitidos = [
            'id_admin',
            'assunto',
            'arquivo',
            'tipo_problema',
            'descricao',
            'status',
        ];

        const setClauses: string[] = [];
        const valores: any[] = [];

        camposPermitidos.forEach(campo => {
            if (dados[campo as keyof Partial<ReporteModel>] !== undefined) {
                setClauses.push(`${campo} = ?`);
                valores.push(dados[campo as keyof Partial<ReporteModel>]);
            }
        });

        if (setClauses.length === 0) return;

        if (dados.status) {
            const permitidos = ['pendente', 'em_analise', 'resolvido', 'arquivado'];
            if (!permitidos.includes(dados.status)) {
                throw new Error('Status inválido. Use: pendente, em_analise, resolvido ou arquivado');
            }
        }

        valores.push(id);

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE reporte SET ${setClauses.join(', ')} WHERE id_reporte = ?`,
            valores
        );

        if (result.affectedRows === 0) throw new Error('Reporte não encontrado');
    },

    async remover(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            `DELETE FROM reporte WHERE id_reporte = ?`,
            [id]
        );
        return result.affectedRows > 0;
    },
};
