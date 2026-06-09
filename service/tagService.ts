import pool from "@/app/lib/dataBase";
import { Tag } from "@/model/tag";


export async function criarTag(dados: Tag) {
  const [result]: any = await pool.query(
    `INSERT INTO tag (id_categoria, id_prestador) VALUES (?, ?)`,
    [dados.id_categoria, dados.id_prestador]
  );

  return {
    id_tag: result.insertId,
    ...dados,
  };
}


export async function listarTagsPorPrestador(idPrestador: number) {
  const [rows] = await pool.query(
    `SELECT t.id_tag, t.id_categoria, c.nome_categoria 
     FROM tag t
     INNER JOIN categoria c ON t.id_categoria = c.id_categoria
     WHERE t.id_prestador = ?`,
    [idPrestador]
  );
  return rows;
}


export async function deletarTag(id: number) {
  await pool.query("DELETE FROM tag WHERE id_tag = ?", [id]);
  return { mensagem: "Tag removida com sucesso." };
}