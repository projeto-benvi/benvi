import pool from "@/app/lib/dataBase";
import { Categoria } from "@/model/categoria";

export async function listarCategorias() {
  const [rows] = await pool.query("SELECT * FROM categoria ORDER BY nome_categoria ASC");
  return rows;
}

export async function buscarCategoriaPorId(id: number) {
  const [rows]: any = await pool.query(
    "SELECT * FROM categoria WHERE id_categoria = ?",
    [id]
  );

  return rows[0];
}

export async function criarCategoria(dados: Categoria) {
  const [result]: any = await pool.query(
    `INSERT INTO categoria (nome_categoria, descricao)
     VALUES (?, ?)`,
    [dados.nome_categoria, dados.descricao || null]
  );

  return {
    id_categoria: result.insertId,
    ...dados,
  };
}

export async function atualizarCategoria(
  id: number,
  dados: Categoria
) {
  await pool.query(
    `UPDATE categoria
     SET nome_categoria = ?, descricao = ?
     WHERE id_categoria = ?`,
    [
      dados.nome_categoria,
      dados.descricao || null,
      id
    ]
  );

  return buscarCategoriaPorId(id);
}

export async function deletarCategoria(id: number) {
  await pool.query("DELETE FROM categoria WHERE id_categoria = ?", [id]);

  return {
    mensagem: "Categoria deletada com sucesso.",
  };
}
