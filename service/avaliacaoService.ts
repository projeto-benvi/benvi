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
        id_prestador,
        id_servico,
        nota,
        comentario,
        comunicacao,
        respeito,
        pontualidade,
        acordo,
        data_avaliacao
      FROM avaliacao
      `
        );

        return rows.map(
            row => new AvaliacaoModel(
                row.id_usuario,
                row.id_prestador,
                row.id_servico,
                row.nota,
                row.comentario,
                row.data_avaliacao,
                row.id_avaliacao,
                row.comunicacao,
                row.respeito,
                row.pontualidade,
                row.acordo
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
            u.is_admin,

            p.descricao_profissional,
            p.status_verificado,
            p.status_social,
            p.impulsiona_perfil,
            p.categoria_principal

        FROM avaliacao a

        INNER JOIN usuario u
            ON a.id_usuario = u.id_usuario

        INNER JOIN prestador p
            ON a.id_prestador = p.id_usuario

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

            },

            prestador: {
                id_usuario: row.id_usuario,
                descricao_profissional: row.descricao_profissional,
                status_verificado: row.status_verificado,
                status_social: row.status_social,
                impulsiona_perfil: row.impulsiona_perfil,
                categoria_principal: row.categoria_principal,

            }
        };

    },

    async listarPorPrestador(id_prestador: number) {

        const [rows] = await pool.query<RowDataPacket[]>(
            `
        SELECT
            a.id_avaliacao,
            a.id_usuario,
            a.id_prestador,
            a.id_servico,
            a.nota,
            a.comentario,
            a.comunicacao,
            a.respeito,
            a.pontualidade,
            a.acordo,
            a.data_avaliacao,
            u.nome,
            u.foto_perfil,
            COALESCE(s.titulo, c.nome_categoria, 'Serviço avaliado') AS titulo,
            s.descricao AS descricao_servico,
            c.nome_categoria AS categoria_servico
        FROM avaliacao a

        INNER JOIN usuario u
            ON a.id_usuario = u.id_usuario

        LEFT JOIN servico s
            ON a.id_servico = s.id_servico

        LEFT JOIN prestador p
            ON a.id_prestador = p.id_usuario

        LEFT JOIN categoria c
            ON p.categoria_principal = c.id_categoria

        WHERE a.id_prestador = ?

        ORDER BY a.data_avaliacao DESC
        `,
            [id_prestador]
        );

        return rows;
    },


    async criar(
        id_usuario: number,
        id_prestador: number,
        id_servico: number,
        nota: number,
        comentario: string,
        comunicacao: number = 5,
        respeito: number = 5,
        pontualidade: number = 5,
        acordo: number = 5
    ): Promise<number> {

        if (id_usuario === id_prestador) {
            throw new Error(
                'Um prestador não pode avaliar a si mesmo'
            );
        }

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

        const [prestador] = await pool.query<RowDataPacket[]>(
            `
            SELECT id_usuario
            FROM prestador
            WHERE id_usuario = ?
`,
            [id_prestador]
        );

        if (prestador.length === 0) {
            throw new Error('Prestador não encontrado');
        }

        const avaliacao = new AvaliacaoModel(
            id_usuario,
            id_prestador,
            id_servico,
            nota,
            comentario,
            new Date(),
            undefined,
            comunicacao,
            respeito,
            pontualidade,
            acordo
        );

        if (!avaliacao.validarNota()) {
            throw new Error(
                'A nota deve estar entre 0 e 5'
            );
        }

        const subAvaliacoes = [avaliacao.comunicacao, avaliacao.respeito, avaliacao.pontualidade, avaliacao.acordo];

        if (subAvaliacoes.some((valor) => valor < 0 || valor > 5)) {
            throw new Error('As subavaliações devem estar entre 0 e 5');
        }

        const [result] = await pool.query<ResultSetHeader>(
            `
      INSERT INTO avaliacao
      (
        id_usuario,
        id_prestador,
        id_servico,
        nota,
        comentario,
        comunicacao,
        respeito,
        pontualidade,
        acordo,
        data_avaliacao
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
            [
                avaliacao.id_usuario,
                avaliacao.id_prestador,
                avaliacao.id_servico,
                avaliacao.nota,
                avaliacao.comentario,
                avaliacao.comunicacao,
                avaliacao.respeito,
                avaliacao.pontualidade,
                avaliacao.acordo,
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