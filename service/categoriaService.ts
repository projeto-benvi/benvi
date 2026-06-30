import pool from "@/app/lib/dataBase";
import { Categoria } from "@/model/categoria";

export const CATEGORIAS_INICIAIS = [
  { nome_categoria: "Eletricista", descricao: "Instala e mantém redes elétricas, fiação, quadros de força e iluminação." },
  { nome_categoria: "Encanador", descricao: "Monta sistemas de água fria, água quente, esgoto e gás." },
  { nome_categoria: "Pedreiro", descricao: "Executa alvenaria, revestimentos, concretagem e acabamentos gerais." },
  { nome_categoria: "Pintor", descricao: "Prepara superfícies com massa, lixa e aplica tintas, vernizes ou texturas." },
  { nome_categoria: "Diarista", descricao: "Serviços de limpeza residencial padrão, manutenção do lar e organização." },
  { nome_categoria: "Faxineira", descricao: "Limpezas profundas, faxinas pós-obra ou pré-mudança residencial e comercial." },
  { nome_categoria: "Jardineiro", descricao: "Manutenção de jardins, poda de árvores, corte de grama e paisagismo residencial." },
  { nome_categoria: "Marceneiro", descricao: "Fabricação e reparo de móveis planejados, portas, armários e artigos de madeira." },
  { nome_categoria: "Serralheiro", descricao: "Fabrica e instala estruturas metálicas, portões, corrimãos e esquadrias." },
  { nome_categoria: "Técnico em Ar-Condicionado", descricao: "Instalação, limpeza, higienização e manutenção de sistemas de refrigeração." },
  { nome_categoria: "Técnico em Informática", descricao: "Formatação, remoção de vírus, reparo de computadores, notebooks e redes." },
  { nome_categoria: "Montador de Móveis", descricao: "Montagem e desmontagem de móveis residenciais ou corporativos." },
  { nome_categoria: "Chaveiro", descricao: "Abertura de portas, cópias de chaves, troca de segredos e fechaduras." },
  { nome_categoria: "Gesseiro", descricao: "Instala divisórias em drywall, tetos rebaixados, molduras e reboco de gesso." },
  { nome_categoria: "Instalador de Câmeras", descricao: "Instalação e configuração de circuitos de CFTV, alarmes e segurança." },
  { nome_categoria: "Manicure e Pedicure", descricao: "Cuidados, embelezamento e estética das unhas das mãos e dos pés." },
  { nome_categoria: "Cabeleireiro", descricao: "Cortes, coloração, tratamentos capilares e penteados." },
  { nome_categoria: "Maquiador(a)", descricao: "Serviços de maquiagem profissional para festas, casamentos e eventos." },
  { nome_categoria: "Designer Gráfico", descricao: "Criação de logotipos, identidades visuais e artes para redes sociais." },
  { nome_categoria: "Fotógrafo", descricao: "Cobertura fotográfica de eventos, ensaios individuais ou corporativos." },
  { nome_categoria: "Personal Trainer", descricao: "Acompanhamento físico personalizado, montagem de treinos e consultoria." },
  { nome_categoria: "Professor Particular / Reforço Escolar", descricao: "Aulas particulares de disciplinas escolares, idiomas e preparatórios." },
  { nome_categoria: "Cuidador de Idosos", descricao: "Assistência, companhia e cuidados com a saúde e bem-estar da terceira idade." },
  { nome_categoria: "Babá", descricao: "Cuidados infantis, recreação e acompanhamento diário de crianças." },
  { nome_categoria: "Lavador de Carros / Estética Automotiva", descricao: "Lavagem, higienização interna e polimento automotivo." },
  { nome_categoria: "Motoboy / Entregador Particular", descricao: "Serviços expressos de entrega de documentos, mercadorias e delivery." },
  { nome_categoria: "Costureira / Ajustes de Roupas", descricao: "Consertos, barras, ajustes de medidas e confecção de roupas sob medida." },
  { nome_categoria: "Confeiteira / Bolos e Doces", descricao: "Produção de bolos artísticos, docinhos para festas e sobremesas." },
  { nome_categoria: "Decorador(a) de Eventos", descricao: "Planejamento visual, ornamentação e arranjos decorativos para festas." },
  { nome_categoria: "Social Media / Gestor de Redes Sociais", descricao: "Gerenciamento de perfis profissionais e estratégias de engajamento." },
];

async function garantirTabelaCategoria() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categoria (
      id_categoria INT PRIMARY KEY AUTO_INCREMENT,
      nome_categoria VARCHAR(100) NOT NULL,
      descricao TEXT
    )
  `);

  const [descricao]: any = await pool.query("SHOW COLUMNS FROM categoria LIKE 'descricao'");
  if (descricao.length === 0) {
    await pool.query("ALTER TABLE categoria ADD COLUMN descricao TEXT NULL");
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tag (
      id_tag INT AUTO_INCREMENT PRIMARY KEY,
      id_prestador INT NOT NULL,
      id_categoria INT NOT NULL,
      data_vinculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_prestador_categoria (id_prestador, id_categoria)
    )
  `);
}

export async function listarCategorias() {
  await garantirTabelaCategoria();
  await popularCategoriasIniciais();

  const [rows] = await pool.query(`
    SELECT
      c.id_categoria,
      c.nome_categoria,
      c.descricao,
      COUNT(DISTINCT pc.id_prestador) AS total_prestadores
    FROM categoria c
    LEFT JOIN (
      SELECT
        p.id_usuario AS id_prestador,
        c2.id_categoria
      FROM prestador p
      INNER JOIN categoria c2
        ON p.categoria_principal = c2.nome_categoria
        OR CAST(p.categoria_principal AS CHAR) = CAST(c2.id_categoria AS CHAR)
      UNION
      SELECT
        t.id_prestador,
        t.id_categoria
      FROM tag t
    ) pc ON pc.id_categoria = c.id_categoria
    GROUP BY c.id_categoria, c.nome_categoria, c.descricao
    ORDER BY c.nome_categoria ASC
  `);

  return rows;
}

export async function buscarCategoriaPorId(id: number) {
  await garantirTabelaCategoria();

  const [rows]: any = await pool.query(
    "SELECT * FROM categoria WHERE id_categoria = ?",
    [id]
  );

  return rows[0];
}

export async function criarCategoria(dados: Categoria) {
  await garantirTabelaCategoria();

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

export async function atualizarCategoria(id: number, dados: Categoria) {
  await garantirTabelaCategoria();

  await pool.query(
    `UPDATE categoria
     SET nome_categoria = ?, descricao = ?
     WHERE id_categoria = ?`,
    [dados.nome_categoria, dados.descricao || null, id]
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
  await garantirTabelaCategoria();

  for (const cat of CATEGORIAS_INICIAIS) {
    const [existente]: any = await pool.query(
      "SELECT id_categoria FROM categoria WHERE nome_categoria = ?",
      [cat.nome_categoria]
    );

    if (existente.length === 0) {
      await pool.query(
        `INSERT INTO categoria (nome_categoria, descricao) 
         VALUES (?, ?)`, 
        [cat.nome_categoria, cat.descricao]
      );
    }
  }

  return { mensagem: "Categorias sincronizadas com sucesso no banco de dados!" };
}
