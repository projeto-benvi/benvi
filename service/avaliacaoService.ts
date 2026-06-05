import pool from '@/app/lib/dataBase';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { Avaliacao } from '@/model/avaliacaoModel';


export const AvaliacaoService = {

    async listar(): Promise<Avaliacao[]> {

        const [rows] = await pool.query<(RowDataPacket & any)[]>(
            `
      SELECT
        id_avaliacao,
        id_usuario,
        nota,
        comentario,
        data_avaliacao
      FROM avaliacao
      `
        );

        return rows.map(
            row => new Avaliacao(
                row.id_usuario,
                row.nota,
                row.comentario,
                row.data_avaliacao,
                row.id_avaliacao
            )
        );
    },

    async buscarPorId(id: number) {

        const avaliacoes =
            await this.listar();

        const avaliacao =
            avaliacoes.find(
                item => item.id_avaliacao === id
            );

        if (!avaliacao) {
            throw new Error(
                'Avaliação não encontrada'
            );
        }

        return avaliacao;
    },

    async criar(
        id_usuario: number,
        nota: number,
        comentario: string
    ): Promise<number> {

        const avaliacao = new Avaliacao(
            id_usuario,
            nota,
            comentario
        );

        if (!avaliacao.validarNota()) {
            throw new Error(
                'A nota deve estar entre 0 e 5'
            );
        }

        const [result] = await pool.query<ResultSetHeader>(
            `
      INSERT INTO avaliacao
      (
        id_usuario,
        nota,
        comentario,
        data_avaliacao
      )
      VALUES (?, ?, ?, ?)
      `,
            [
                avaliacao.id_usuario,
                avaliacao.nota,
                avaliacao.comentario,
                avaliacao.data_avaliacao
            ]
        );

        return result.insertId;
    },

    async atualizar(
        id: number,
        nota: number,
        comentario: string
    ) {

        if (nota < 0 || nota > 5) {
            throw new Error(
                'A nota deve estar entre 0 e 5'
            );
        }

        const [result] =
            await pool.query<ResultSetHeader>(
                `
      UPDATE avaliacao
      SET
        nota = ?,
        comentario = ?
      WHERE id_avaliacao = ?
      `,
                [
                    nota,
                    comentario,
                    id
                ]
            );

        if (result.affectedRows === 0) {
            throw new Error(
                'Avaliação não encontrada'
            );
        }

        return true;
    },

    async remover(
        id: number
    ): Promise<boolean> {

        const [result] = await pool.query<ResultSetHeader>(
            `
      DELETE FROM avaliacao
      WHERE id_avaliacao = ?
      `,
            [id]
        );

        return result.affectedRows > 0;
    }

};