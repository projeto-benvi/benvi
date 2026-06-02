import pool from '@/app/lib/dataBase';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Avaliacao } from './interface/Avaliacao';

export const AvaliacaoModel = {

  async getAll(): Promise<Avaliacao[]> {
    const [rows] = await pool.query<(RowDataPacket & Avaliacao)[]>(
      `
      SELECT
        id_avaliacao,
        nota,
        comentario,
        data_avaliacao
      FROM avaliacao
      ORDER BY data_avaliacao DESC
      `
    );

    return rows;
  },

  async getById(id: number): Promise<Avaliacao | null> {

    const [rows] = await pool.query<(RowDataPacket & Avaliacao)[]>(
      `
      SELECT
        id_avaliacao,
        nota,
        comentario,
        data_avaliacao
      FROM avaliacao
      WHERE id_avaliacao = ?
      `,
      [id]
    );

    return rows.length > 0 ? rows[0] : null;
  },

  async create(
    nota: number,
    comentario: string,
    data_avaliacao: Date
  ): Promise<number> {

    //erro
    console.log('VALORES RECEBIDOS NO MODEL');
    console.log({
      nota,
      comentario,
      data_avaliacao
    });


    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO avaliacao
      (
        nota,
        comentario,
        data_avaliacao
      )
      VALUES (?, ?, ?)
      `,
      [
        nota,
        comentario,
        data_avaliacao
      ]
    );

    return result.insertId;
  },

  async update(
    id: number,
    nota: number,
    comentario: string
  ): Promise<boolean> {

    const [result] = await pool.query<ResultSetHeader>(
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

    return result.affectedRows > 0;
  },

  async delete(id: number): Promise<boolean> {

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