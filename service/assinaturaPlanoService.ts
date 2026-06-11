import pool from '@/app/lib/dataBase';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { AssinaturaPlanoModel } from '@/model/assinaturaPlanoModel';

export const AssinaturaPlanoService = {

    async listar() {

        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                a.id_assinatura,
                a.valor_pago,
                a.data_inicio,
                a.data_fim,
                a.status_pagamento,
                a.ativo,

                p.id_usuario        AS id_prestador,
                u.nome              AS nome_prestador,
                u.email             AS email_prestador,
                u.telefone          AS telefone_prestador,
                u.foto_perfil       AS foto_prestador,
                u.cidade            AS cidade_prestador,
                p.categoria_principal,
                p.status_verificado,
                p.status_social,
                p.impulsiona_perfil,
                p.descricao_profissional

            FROM assinaturaplano a

            INNER JOIN prestador p
                ON a.id_prestador = p.id_usuario

            INNER JOIN usuario u
                ON p.id_usuario = u.id_usuario

            ORDER BY a.data_inicio DESC
            `
        );

        return rows.map(row => ({
            id_assinatura:    row.id_assinatura,
            valor_pago:       row.valor_pago,
            data_inicio:      row.data_inicio,
            data_fim:         row.data_fim,
            status_pagamento: row.status_pagamento,
            ativo:            row.ativo,

            prestador: {
                id_usuario:              row.id_prestador,
                nome:                    row.nome_prestador,
                email:                   row.email_prestador,
                telefone:                row.telefone_prestador,
                foto_perfil:             row.foto_prestador,
                cidade:                  row.cidade_prestador,
                categoria_principal:     row.categoria_principal,
                status_verificado:       row.status_verificado,
                status_social:           row.status_social,
                impulsiona_perfil:       row.impulsiona_perfil,
                descricao_profissional:  row.descricao_profissional,
            },
        }));
    },

    async buscarPorId(id: number) {

        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                a.id_assinatura,
                a.valor_pago,
                a.data_inicio,
                a.data_fim,
                a.status_pagamento,
                a.ativo,

                p.id_usuario        AS id_prestador,
                u.nome              AS nome_prestador,
                u.email             AS email_prestador,
                u.telefone          AS telefone_prestador,
                u.foto_perfil       AS foto_prestador,
                u.cidade            AS cidade_prestador,
                p.categoria_principal,
                p.status_verificado,
                p.status_social,
                p.impulsiona_perfil,
                p.descricao_profissional

            FROM assinaturaplano a

            INNER JOIN prestador p
                ON a.id_prestador = p.id_usuario

            INNER JOIN usuario u
                ON p.id_usuario = u.id_usuario

            WHERE a.id_assinatura = ?
            `,
            [id]
        );

        if (rows.length === 0) {
            throw new Error('Assinatura não encontrada');
        }

        const row = rows[0];

        return {
            id_assinatura:    row.id_assinatura,
            valor_pago:       row.valor_pago,
            data_inicio:      row.data_inicio,
            data_fim:         row.data_fim,
            status_pagamento: row.status_pagamento,
            ativo:            row.ativo,

            prestador: {
                id_usuario:             row.id_prestador,
                nome:                   row.nome_prestador,
                email:                  row.email_prestador,
                telefone:               row.telefone_prestador,
                foto_perfil:            row.foto_prestador,
                cidade:                 row.cidade_prestador,
                categoria_principal:    row.categoria_principal,
                status_verificado:      row.status_verificado,
                status_social:          row.status_social,
                impulsiona_perfil:      row.impulsiona_perfil,
                descricao_profissional: row.descricao_profissional,
            },
        };
    },

    async listarPorPrestador(id_prestador: number) {

        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                a.id_assinatura,
                a.valor_pago,
                a.data_inicio,
                a.data_fim,
                a.status_pagamento,
                a.ativo
            FROM assinaturaplano a
            WHERE a.id_prestador = ?
            ORDER BY a.data_inicio DESC
            `,
            [id_prestador]
        );

        return rows;
    },

    async buscarAtivaByPrestador(id_prestador: number) {

        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                a.id_assinatura,
                a.valor_pago,
                a.data_inicio,
                a.data_fim,
                a.status_pagamento,
                a.ativo
            FROM assinaturaplano a
            WHERE a.id_prestador = ?
              AND a.ativo = true
            LIMIT 1
            `,
            [id_prestador]
        );

        return rows[0] ?? null;
    },

    async criar(dados: {
        id_prestador: number;
        valor_pago: number;
        data_inicio: Date;
        data_fim: Date;
        status_pagamento?: string;
        ativo?: boolean;
    }): Promise<number> {

        const [prestador] = await pool.query<RowDataPacket[]>(
            `SELECT id_usuario FROM prestador WHERE id_usuario = ?`,
            [dados.id_prestador]
        );
        if (prestador.length === 0) {
            throw new Error('Prestador não encontrado');
        }

        const assinatura = new AssinaturaPlanoModel(
            dados.id_prestador,
            dados.valor_pago,
            new Date(dados.data_inicio),
            new Date(dados.data_fim),
            dados.status_pagamento ?? 'pendente',
            dados.ativo ?? true
        );

        if (!assinatura.validarDatas()) {
            throw new Error('A data de início deve ser anterior à data de fim');
        }

        if (!assinatura.valorValido()) {
            throw new Error('O valor pago deve ser maior que zero');
        }

        if (!assinatura.statusValido()) {
            throw new Error('Status inválido. Use: pendente, pago, cancelado ou expirado');
        }

        const [result] = await pool.query<ResultSetHeader>(
            `
            INSERT INTO assinaturaplano
                (id_prestador, valor_pago, data_inicio, data_fim, status_pagamento, ativo)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                assinatura.id_prestador,
                assinatura.valor_pago,
                assinatura.data_inicio,
                assinatura.data_fim,
                assinatura.status_pagamento,
                assinatura.ativo ? 1 : 0,
            ]
        );

        return result.insertId;
    },

    async atualizar(id: number, dados: Partial<AssinaturaPlanoModel>): Promise<void> {

        const camposPermitidos = [
            'valor_pago',
            'data_inicio',
            'data_fim',
            'status_pagamento',
            'ativo',
        ];

        const setClauses: string[] = [];
        const valores: any[] = [];

        camposPermitidos.forEach(campo => {
            if (dados[campo as keyof Partial<AssinaturaPlanoModel>] !== undefined) {
                setClauses.push(`${campo} = ?`);
                valores.push(dados[campo as keyof Partial<AssinaturaPlanoModel>]);
            }
        });

        if (setClauses.length === 0) return;

        if (dados.status_pagamento) {
            const statusPermitidos = ['pendente', 'pago', 'cancelado', 'expirado'];
            if (!statusPermitidos.includes(dados.status_pagamento)) {
                throw new Error('Status inválido. Use: pendente, pago, cancelado ou expirado');
            }
        }

        if (dados.data_inicio && dados.data_fim) {
            if (new Date(dados.data_inicio) >= new Date(dados.data_fim)) {
                throw new Error('A data de início deve ser anterior à data de fim');
            }
        }

        valores.push(id);

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE assinaturaplano SET ${setClauses.join(', ')} WHERE id_assinatura = ?`,
            valores
        );

        if (result.affectedRows === 0) {
            throw new Error('Assinatura não encontrada');
        }
    },

    async remover(id: number): Promise<boolean> {

        const [result] = await pool.query<ResultSetHeader>(
            `DELETE FROM assinaturaplano WHERE id_assinatura = ?`,
            [id]
        );

        return result.affectedRows > 0;
    },
};