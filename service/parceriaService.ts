import pool from '@/app/lib/dataBase';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ParceriaModel } from '@/model/parceriaModel';

export const ParceriaService = {

    async listar() {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT
                id_parceria,
                nome_parceiro,
                cidade,
                estado,
                status,
                data_inicio,
                data_fim
             FROM parceria
             ORDER BY data_inicio DESC`
        );
        return rows;
    },

    async buscarPorId(id: number) {
        if (!id || isNaN(id)) throw new Error('ID inválido');

        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT
                id_parceria,
                nome_parceiro,
                cidade,
                estado,
                status,
                data_inicio,
                data_fim
             FROM parceria
             WHERE id_parceria = ?`,
            [id]
        );

        if (rows.length === 0) throw new Error('Parceria não encontrada');
        return rows[0];
    },

    async listarPorStatus(status: string) {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT
                id_parceria,
                nome_parceiro,
                cidade,
                estado,
                status,
                data_inicio,
                data_fim
             FROM parceria
             WHERE status = ?
             ORDER BY data_inicio DESC`,
            [status]
        );
        return rows;
    },

    async listarPorEstado(estado: string) {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT
                id_parceria,
                nome_parceiro,
                cidade,
                estado,
                status,
                data_inicio,
                data_fim
             FROM parceria
             WHERE estado = ?
             ORDER BY nome_parceiro ASC`,
            [estado]
        );
        return rows;
    },

    async criar(dados: {
        nome_parceiro: string;
        cidade: string;
        estado: string;
        status?: string;
        data_inicio: Date;
        data_fim?: Date;
    }): Promise<number> {

        const parceria = new ParceriaModel(dados);

        if (!parceria.statusValido()) {
            throw new Error('Status inválido. Use: ativo, inativo, encerrado ou suspenso');
        }

        if (!parceria.datasValidas()) {
            throw new Error('A data de início deve ser anterior à data de fim');
        }

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO parceria
                (nome_parceiro, cidade, estado, status, data_inicio, data_fim)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                parceria.nome_parceiro,
                parceria.cidade,
                parceria.estado,
                parceria.status,
                parceria.data_inicio,
                parceria.data_fim ?? null,
            ]
        );

        return result.insertId;
    },

    async atualizar(id: number, dados: Partial<ParceriaModel>): Promise<void> {
        const camposPermitidos = [
            'nome_parceiro',
            'cidade',
            'estado',
            'status',
            'data_inicio',
            'data_fim',
        ];

        const setClauses: string[] = [];
        const valores: any[] = [];

        camposPermitidos.forEach(campo => {
            if (dados[campo as keyof Partial<ParceriaModel>] !== undefined) {
                setClauses.push(`${campo} = ?`);
                valores.push(dados[campo as keyof Partial<ParceriaModel>]);
            }
        });

        if (setClauses.length === 0) return;

        if (dados.status) {
            const permitidos = ['ativo', 'inativo', 'encerrado', 'suspenso'];
            if (!permitidos.includes(dados.status)) {
                throw new Error('Status inválido. Use: ativo, inativo, encerrado ou suspenso');
            }
        }

        valores.push(id);

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE parceria SET ${setClauses.join(', ')} WHERE id_parceria = ?`,
            valores
        );

        if (result.affectedRows === 0) throw new Error('Parceria não encontrada');
    },

    async remover(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            `DELETE FROM parceria WHERE id_parceria = ?`,
            [id]
        );
        return result.affectedRows > 0;
    },
};
