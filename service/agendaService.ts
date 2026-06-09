import pool from "@/app/lib/dataBase";
import { Agenda } from "@/model/agenda";
import { ResultSetHeader } from "mysql2";

export class AgendaService {

    async listar(): Promise<Agenda[]> {
        const [rows]: any = await pool.query(
            "SELECT * FROM agenda"
        );

        return rows;
    }

    async buscarPorId(id: number): Promise<Agenda | null> {
        const [rows]: any = await pool.query(
            "SELECT * FROM agenda WHERE id_agenda = ?",
            [id]
        );

        return rows.length ? rows[0] : null;
    }

    async criar(agenda: Agenda): Promise<number> {
        const [result]: any = await pool.query(
            `INSERT INTO agenda
            (
                id_prestador,
                id_solicitacao,
                horario_inicio,
                horario_fim,
                status,
                titulo,
                descricao
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                agenda.id_prestador,
                agenda.id_solicitacao,
                agenda.horario_inicio,
                agenda.horario_fim,
                agenda.status,
                agenda.titulo,
                agenda.descricao
            ]
        );

        return result.insertId;
    }

    async atualizar(id: number, agenda: Agenda): Promise<boolean> {

        const [result]: any = await pool.query(
            `UPDATE agenda SET
                id_prestador = ?,
                id_solicitacao = ?,
                horario_inicio = ?,
                horario_fim = ?,
                status = ?,
                titulo = ?,
                descricao = ?
            WHERE id_agenda = ?`,
            [
                agenda.id_prestador,
                agenda.id_solicitacao,
                agenda.horario_inicio,
                agenda.horario_fim,
                agenda.status,
                agenda.titulo,
                agenda.descricao,
                id
            ]
        );

        return result.affectedRows > 0;
    }

    async remover(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            `DELETE FROM agenda 
            WHERE id_agenda = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
}