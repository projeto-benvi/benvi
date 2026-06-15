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


export async function popularCategoriasIniciais() {
  const listaCategorias = [
    { nome: "Pedreiro", desc: "Executa a alvenaria, revestimentos, concretagem e acabamentos gerais." },
    { nome: "Eletricista", desc: "Instala e mantém redes elétricas, fiação, quadros de força e iluminação." },
    { nome: "Encanador", desc: "Monta sistemas de água fria, água quente, esgoto e gás." },
    { nome: "Carpinteiro", desc: "Constrói formas de madeira para concreto, andaimes, telhados e estruturas de suporte." },
    { nome: "Pintor", desc: "Prepara superfícies com massa, lixa e aplica tintas, vernizes ou texturas." },
    { nome: "Gesseiro", desc: "Instala divisórias em drywall, tetos rebaixados, molduras e reboco de gesso." },
    { nome: "Serralheiro", desc: "Fabrica e instala estruturas metálicas, portões, corrimãos e esquadrias de ferro ou alumínio." }
  ];

  // Executa um loop inserindo cada categoria com sua respectiva descrição
  for (const cat of listaCategorias) {
    await pool.query(
      `INSERT INTO categoria (nome_categoria, descricao) 
       VALUES (?, ?)`, 
      [cat.nome, cat.desc]
    );
  }

  return { mensagem: "Todas as categorias iniciais foram inseridas com sucesso!" };
}