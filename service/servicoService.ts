import pool from '@/app/lib/dataBase';
import { Servico } from '@/model/servicoModel';


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
       LEFT JOIN categoria c ON s.id_categoria = c.id_categoria
       WHERE u.status_conta = 'ativo'
         AND COALESCE(p.status_social, 'ativo') = 'ativo'
         AND LOWER(s.status_servico) <> 'inativo'`
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
       WHERE s.id_servico = ?
         AND u.status_conta = 'ativo'
         AND COALESCE(p.status_social, 'ativo') = 'ativo'
         AND LOWER(s.status_servico) <> 'inativo'`, [id]
    );
    return rows[0] ?? null;
  },

// BUSCA CORRIGIDA: Agora traz os dados do prestador junto com os serviços
  async buscarPorPrestador(idPrestador: number): Promise<any[]> {
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
       WHERE s.id_prestador = ?
         AND u.status_conta = 'ativo'
         AND COALESCE(p.status_social, 'ativo') = 'ativo'
         AND LOWER(s.status_servico) <> 'inativo'
       ORDER BY s.data_inicio DESC, s.id_servico DESC`, [idPrestador]
    );
    return rows as any[];
  },

  // Cria un novo serviço
  async criar(dados: Omit<Servico, 'id_servico'> & { tempo_execucao?: string }): Promise<number> {
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
