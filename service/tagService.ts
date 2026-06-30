import pool from "@/app/lib/dataBase";
import { Tag } from "@/model/tag";

async function garantirTabelaTag() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tag (
      id_tag INT AUTO_INCREMENT PRIMARY KEY,
      id_prestador INT NOT NULL,
      id_categoria INT NOT NULL,
      data_vinculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_prestador_categoria (id_prestador, id_categoria)
    )
  `);

  const [colunas]: any = await pool.query('SHOW COLUMNS FROM tag');
  const nomes = new Set(colunas.map((coluna: { Field: string }) => coluna.Field));

  if (!nomes.has('id_prestador') || !nomes.has('id_categoria')) {
    await pool.query('DROP TABLE tag');
    await pool.query(`
      CREATE TABLE tag (
        id_tag INT AUTO_INCREMENT PRIMARY KEY,
        id_prestador INT NOT NULL,
        id_categoria INT NOT NULL,
        data_vinculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_prestador_categoria (id_prestador, id_categoria)
      )
    `);
  }
}

async function filtrarCategoriasExistentes(idsCategorias: number[]) {
  const idsUnicos = Array.from(
    new Set(
      idsCategorias
        .map((idCategoria) => Number(idCategoria))
        .filter((idCategoria) => Number.isInteger(idCategoria) && idCategoria > 0)
    )
  );

  if (idsUnicos.length === 0) {
    return [];
  }

  const placeholders = idsUnicos.map(() => '?').join(',');
  const [categorias]: any = await pool.query(
    `SELECT id_categoria FROM categoria WHERE id_categoria IN (${placeholders})`,
    idsUnicos
  );

  return categorias.map((categoria: { id_categoria: number }) => Number(categoria.id_categoria));
}

export async function criarTag(dados: Tag) {
  await garantirTabelaTag();

  const [result]: any = await pool.query(
    `INSERT IGNORE INTO tag (id_categoria, id_prestador) VALUES (?, ?)`,
    [dados.id_categoria, dados.id_prestador]
  );

  return {
    id_tag: result.insertId,
    ...dados,
  };
}

export async function listarTagsPorPrestador(idPrestador: number) {
  await garantirTabelaTag();

  const [rows] = await pool.query(
    `SELECT t.id_tag, t.id_categoria, c.nome_categoria 
     FROM tag t
     INNER JOIN categoria c ON t.id_categoria = c.id_categoria
     WHERE t.id_prestador = ?
     ORDER BY c.nome_categoria ASC`,
    [idPrestador]
  );
  return rows;
}

export async function substituirTagsDoPrestador(idPrestador: number, idsCategorias: number[]) {
  await garantirTabelaTag();

  const [prestadores]: any = await pool.query(
    "SELECT id_usuario FROM prestador WHERE id_usuario = ? LIMIT 1",
    [idPrestador]
  );

  if (prestadores.length === 0) {
    throw new Error("Prestador não encontrado para vincular tags.");
  }

  const idsValidos = await filtrarCategoriasExistentes(idsCategorias);

  await pool.query("DELETE FROM tag WHERE id_prestador = ?", [idPrestador]);

  for (const idCategoria of idsValidos) {
    await pool.query(
      "INSERT IGNORE INTO tag (id_categoria, id_prestador) VALUES (?, ?)",
      [idCategoria, idPrestador]
    );
  }

  return listarTagsPorPrestador(idPrestador);
}

export async function deletarTag(id: number) {
  await garantirTabelaTag();

  await pool.query("DELETE FROM tag WHERE id_tag = ?", [id]);
  return { mensagem: "Tag removida com sucesso." };
}
