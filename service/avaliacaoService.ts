import pool from '@/app/lib/dataBase';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { AvaliacaoModel } from '@/model/avaliacaoModel';
//import { Avaliacao } from '@/model/avaliacaoModel';


export const AvaliacaoService = {

    async listar(): Promise<AvaliacaoModel[]> {

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
            row => new AvaliacaoModel(
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

        //buscar tambem as informações do usuário para retornar junto com a avaliação

        const [rows] = await pool.query<RowDataPacket[]>(
            `
        SELECT
            a.id_avaliacao,
            a.id_usuario,
            a.nota,
            a.comentario,
            a.data_avaliacao,

            u.id_usuario,
            u.nome,
            u.email,
            u.telefone,
            u.cidade,
            u.nivel_acesso,
            u.status_conta,
            u.data_criacao,
            u.is_admin

        FROM avaliacao a

        INNER JOIN usuario u
            ON a.id_usuario = u.id_usuario

        WHERE a.id_avaliacao = ?
        `,
            [id]
        );

        if (rows.length === 0) {
            throw new Error(
                'Avaliação não encontrada'
            );
        }

        //return rows[0];
        const row = rows[0];

        return {
            id_avaliacao: row.id_avaliacao,
            nota: row.nota,
            comentario: row.comentario,
            data_avaliacao: row.data_avaliacao,

            usuario: {
                id_usuario: row.id_usuario,
                nome: row.nome,
                email: row.email,
                telefone: row.telefone,
                cidade: row.cidade,
                nivel_acesso: row.nivel_acesso,
                status_conta: row.status_conta,
                data_criacao: row.data_criacao,
                is_admin: row.is_admin
            }
        };

    },


    async criar(
        id_usuario: number,
        nota: number,
        comentario: string



    ): Promise<number> {

        const [usuario] = await pool.query<RowDataPacket[]>(
            `
            SELECT id_usuario
            FROM usuario
            WHERE id_usuario = ?
        `,
            [id_usuario]
        );

        if (usuario.length === 0) {
            throw new Error('Usuário não encontrado');
        }

        const avaliacao = new AvaliacaoModel(
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