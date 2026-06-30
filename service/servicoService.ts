import pool from '@/app/lib/dataBase';
import { Servico } from '@/model/servicoModel';

async function garantirTabelaServico() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS servico (
      id_servico INT AUTO_INCREMENT PRIMARY KEY,
      id_prestador INT NOT NULL,
      id_categoria INT NULL,
      titulo VARCHAR(255) NOT NULL,
      descricao TEXT NOT NULL,
      status_servico VARCHAR(50) NOT NULL DEFAULT 'ativo',
      data_inicio DATETIME NULL,
      data_fim DATETIME NULL,
      tempo_execucao VARCHAR(100) NULL,
      imagens JSON NULL
    )
  `);

  const [colunas]: any = await pool.query('SHOW COLUMNS FROM servico');
  const nomes = new Set(colunas.map((coluna: { Field: string }) => coluna.Field));

  if (!nomes.has('data_inicio')) await pool.query('ALTER TABLE servico ADD COLUMN data_inicio DATETIME NULL');
  if (!nomes.has('data_fim')) await pool.query('ALTER TABLE servico ADD COLUMN data_fim DATETIME NULL');
  if (!nomes.has('imagens')) await pool.query('ALTER TABLE servico ADD COLUMN imagens JSON NULL');
  if (!nomes.has('tempo_execucao')) await pool.query('ALTER TABLE servico ADD COLUMN tempo_execucao VARCHAR(100) NULL');

  await pool.query('ALTER TABLE servico MODIFY id_categoria INT NULL').catch(() => null);
  await pool.query('ALTER TABLE servico MODIFY data_inicio DATETIME NULL').catch(() => null);
  await pool.query('ALTER TABLE servico MODIFY data_fim DATETIME NULL').catch(() => null);
  await pool.query('ALTER TABLE servico MODIFY tempo_execucao VARCHAR(100) NULL').catch(() => null);
}


export const servicoService = {

// Substitua apenas este método dentro do seu servicoService.ts
  async listarTodos(): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT 
        s.id_servico,
        s.id_prestador,
        s.id_categoria,
        c.nome_categoria AS nome_categoria,
        s.titulo,
        s.descricao,
        s.status_servico,
        s.data_inicio,
        s.data_fim,
        s.imagens,
        p.descricao_profissional,
        p.categoria_principal,
        p.status_verificado,
        u.nome AS nome_prestador,
        u.email AS email_prestador,
        u.telefone AS telefone_prestador,
        u.foto_perfil AS foto_prestador,
        u.cidade AS cidade_prestador
       FROM servico s
       LEFT JOIN prestador p ON s.id_prestador = p.id_usuario
       LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
       LEFT JOIN categoria c ON s.id_categoria = c.id_categoria`
    );
    return rows as any[];
  },

  // 2. CORRIGIDO: Busca por ID trazendo a mesma estrutura limpa de dados conectados
  async buscarPorId(id: number): Promise<any | null> {
    const [rows]: any = await pool.query(
      `SELECT 
        s.id_servico,
        s.id_prestador,
        s.id_categoria,
        c.nome_categoria AS nome_categoria,
        s.titulo,
        s.descricao,
        s.status_servico,
        s.data_inicio,
        s.data_fim,
        s.imagens,
        p.descricao_profissional,
        p.categoria_principal,
        p.status_verificado,
        u.nome AS nome_prestador,
        u.email AS email_prestador,
        u.telefone AS telefone_prestador,
        u.foto_perfil AS foto_prestador,
        u.cidade AS cidade_prestador
       FROM servico s
       LEFT JOIN prestador p ON s.id_prestador = p.id_usuario
       LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
       LEFT JOIN categoria c ON s.id_categoria = c.id_categoria
       WHERE s.id_servico = ?`, [id]
    );
    return rows[0] ?? null;
  },

// BUSCA CORRIGIDA: Agora traz os dados do prestador junto com os serviços
  async buscarPorPrestador(idPrestador: number): Promise<any[]> {
    await garantirTabelaServico();

    const [rows]: any = await pool.query(
      `SELECT 
        s.*,
        u.nome AS nome_prestador,
        u.foto_perfil AS foto_prestador,
        u.cidade AS cidade_prestador,
        p.descricao_profissional,
        p.categoria_principal
       FROM servico s
       LEFT JOIN prestador p ON s.id_prestador = p.id_usuario
       LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
       WHERE s.id_prestador = ?`, [idPrestador]
    );
    return rows as any[];
  },

  // Cria un novo serviço
  async criar(dados: Omit<Servico, 'id_servico'> & { tempo_execucao?: string }): Promise<number> {
    await garantirTabelaServico();

    const idPrestador = Number(dados.id_prestador);
    if (!Number.isInteger(idPrestador) || idPrestador <= 0) {
      throw new Error('Prestador inválido para criar serviço.');
    }

    const dataInicio = dados.data_inicio ? new Date(dados.data_inicio) : null;
    const dataFim = dados.data_fim ? new Date(dados.data_fim) : null;

    const [result]: any = await pool.query(
      `INSERT INTO servico (
        id_prestador, id_categoria, titulo, descricao, status_servico, data_inicio, data_fim, tempo_execucao, imagens
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idPrestador,
        dados.id_categoria ?? null,
        dados.titulo || 'Serviço solicitado',
        dados.descricao || 'Serviço criado a partir de solicitação aceita.',
        dados.status_servico ?? 'ativo',
        dataInicio && !Number.isNaN(dataInicio.getTime()) ? dataInicio : null,
        dataFim && !Number.isNaN(dataFim.getTime()) ? dataFim : null,
        dados.tempo_execucao ?? null,
        JSON.stringify(dados.imagens ?? [])
      ]
    );

    return result.insertId;
  },

  // Atualiza dados do serviço
  async atualizar(id: number, dados: Partial<Servico>): Promise<void> {
    
    if (dados.imagens) {
      (dados as any).imagens = JSON.stringify(dados.imagens); 
    }
    if (Object.keys(dados).length === 0) return;

    const campos = Object.keys(dados).map(k => `${k} = ?`).join(', ');
    const valores = [...Object.values(dados), id];
    
    await pool.query(
      `UPDATE servico SET ${campos} WHERE id_servico = ?`, valores
    );
  },

  // Deleta um serviço
  async deletar(id: number): Promise<void> {
    await pool.query(
      'DELETE FROM servico WHERE id_servico = ?', [id]
    );
  }
}