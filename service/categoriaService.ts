import pool from "@/app/lib/dataBase";
import { Categoria } from "@/model/categoria";


export async function listarCategorias() {
  const query = `
    SELECT 
      c.id_categoria, 
      c.nome_categoria, 
      c.descricao, 
      c.status, 
      c.data_criacao,
      COUNT(p.id_usuario) AS total_prestadores -- 👈 Conta quantos prestadores estão nessa categoria
    FROM categoria c
    LEFT JOIN prestador p ON p.id_categoria_principal = c.id_categoria -- 👈 Junta com a tabela de prestadores
    GROUP BY c.id_categoria
    ORDER BY c.nome_categoria ASC
  `;

  const [rows] = await pool.query(query);
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

// FUNÇÃO CORRIGIDA COM PREVENÇÃO DE DUPLICIDADE E TODAS AS CATEGORIAS DA IMAGEM
export async function popularCategoriasIniciais() {
  const listaCategorias = [
    { nome_categoria: "Pedreiro", descricao: "Executa a alvenaria, revestimentos, concretagem e acabamentos gerais." },
    { nome_categoria: "Eletricista", descricao: "Instala e mantém redes elétricas, fiação, quadros de força e iluminação." },
    { nome_categoria: "Encanador", descricao: "Monta sistemas de água fria, água quente, esgoto e gás." },
    { nome_categoria: "Carpinteiro", descricao: "Constrói formas de madeira para concreto, andaimes, telhados e estruturas de suporte." },
    { nome_categoria: "Pintor", descricao: "Prepara superfícies com massa, lixa e aplica tintas, vernizes ou texturas." },
    { nome_categoria: "Gesseiro", descricao: "Instala divisórias in drywall, tetos rebaixados, molduras e reboco de gesso." },
    { nome_categoria: "Serralheiro", descricao: "Fabrica e instala estruturas metálicas, portões, corrimãos e esquadrias de ferro ou alumínio." },
    { nome_categoria: "Diarista", descricao: "Serviços de limpeza residencial padrão, manutenção do lar e organização." },
    { nome_categoria: "Faxineira", descricao: "Limpezas profundas, faxinas pós-obra ou pré-mudança residencial e comercial." },
    { nome_categoria: "Jardineiro", descricao: "Manutenção de jardins, poda de árvores, corte de grama e paisagismo residencial." },
    { nome_categoria: "Marceneiro", descricao: "Fabricação e reparo de móveis planejados, portas, armários e artigos de madeira." },
    { nome_categoria: "Técnico em Ar-Condicionado", descricao: "Instalação, limpeza, higienização e manutenção de sistemas de refrigeração." },
    { nome_categoria: "Técnico em Informática", descricao: "Formatação, remoção de vírus, reparo de computadores, notebooks e redes." },
    { nome_categoria: "Montador de Móveis", descricao: "Montagem e desmontagem de móveis convencionais ou corporativos." },
    { nome_categoria: "Chaveiro", descricao: "Abertura de portas, cópias de chaves, troca de segredos e fechaduras." },
    { nome_categoria: "Instalador de Câmeras", descricao: "Instalação e configuração de circuitos de CFTV, alarmes e segurança." },
    { nome_categoria: "Manicure e Pedicure", descricao: "Cuidados, embelezamento e estética das unhas das mãos e dos pés." },
    { nome_categoria: "Cabeleireiro", descricao: "Cortes, coloração, tratamentos capilares e penteados masculinos e femininos." },
    { nome_categoria: "Maquiador(a)", descricao: "Serviços de maquiagem profissional para festas, casamentos e eventos." },
    { nome_categoria: "Designer Gráfico", descricao: "Criação de logotipos, identidades visuais e artes para redes sociais." },
    { nome_categoria: "Fotógrafo", descricao: "Cobertura fotográfica de eventos, ensaios individuais ou corporativos." },
    { nome_categoria: "Personal Trainer", descricao: "Acompanhamento físico personalizado, montagem de treinos e consultoria." },
    { nome_categoria: "Professor Particular / Reforço Escolar", descricao: "Aulas particulares de disciplinas escolares, idiomas e preparatórios." },
    { nome_categoria: "Cuidador de Idosos", descricao: "Assistência, companhia e cuidados com a saúde e bem-estar da terceira idade." },
    { nome_categoria: "Babá", descricao: "Cuidados infantis, recreação e acompanhamento diário de crianças." },
    { nome_categoria: "Lavador de Carros / Estética Automotiva", descricao: "Lavagem, higienização interna e polimento automotivo a domicílio." },
    { nome_categoria: "Motoboy / Entregador Particular", descricao: "Serviços expressos de entrega de documentos, mercadorias e delivery." },
    { nome_categoria: "Costureira / Ajustes de Roupas", descricao: "Consertos, barras, ajustes de medidas e confecção de roupas sob medida." },
    { nome_categoria: "Confeiteira / Bolos e Doces", descricao: "Produção de bolos artísticos, docinhos para festas e sobremesas." },
    { nome_categoria: "Decorador(a) de Eventos", descricao: "Planejamento visual, ornamentação e arranjos decorativos para festas." },
    { nome_categoria: "Social Media / Gestor de Redes Sociais", descricao: "Gerenciamento de perfis profissionais e estratégias de engajamento." }
  ];

  // Loop corrigido com validação anti-duplicação
  for (const cat of listaCategorias) {
    // 1. Verifica se a categoria com esse nome exato já existe na tabela
    const [existente]: any = await pool.query(
      "SELECT id_categoria FROM categoria WHERE nome_categoria = ?",
      [cat.nome_categoria]
    );

    // 2. Se o array retornado for vazio (length === 0), significa que não existe. Pode inserir!
    if (existente.length === 0) {
      await pool.query(
        `INSERT INTO categoria (nome_categoria, descricao) 
         VALUES (?, ?)`, 
        [cat.nome_categoria, cat.descricao]
      );
    }
  }

  return { mensagem: "Categorias sincronizadas e atualizadas com sucesso no banco de dados!" };
}