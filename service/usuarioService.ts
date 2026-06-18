import pool from '@/app/lib/dataBase';
import { Usuario } from '@/model/usuario';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2/promise';

export const usuarioService = {
  async listarTodos(): Promise<Usuario[]> {
    const [rows] = await pool.query(
      'SELECT id_usuario, nome, email, telefone, cidade, nivel_acesso, status_conta, data_criacao, is_admin FROM usuario'
    );
    return rows as Usuario[];
  },

  async buscarPorId(id: number): Promise<Usuario | null> {
    const [rows]: any = await pool.query(
      'SELECT id_usuario, nome, email, telefone, foto_perfil, cidade, nivel_acesso, status_conta, is_admin FROM usuario WHERE id_usuario = ?',
      [id]
    );
    return rows[0] ?? null;
  },

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const [rows]: any = await pool.query(
      'SELECT id_usuario, nome, email, telefone, foto_perfil, cidade, nivel_acesso, status_conta, is_admin FROM usuario WHERE email = ?',
      [email]
    );
    return rows[0] ?? null;
  },

  async validarLogin(email: string, senha: string): Promise<Usuario | null> {
    const [rows]: any = await pool.query(
      'SELECT * FROM usuario WHERE email = ? AND status_conta = "ativo"',
      [email]
    );
    const usuario = rows[0];
    if (!usuario) return null;

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) return null;

    const { senha: _, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha as Usuario;
  },

  async criar(dados: Omit<Usuario, 'id_usuario'>): Promise<number> {
    const senhaHash = await bcrypt.hash(dados.senha, 10);
    const [result]: any = await pool.query(
      `INSERT INTO usuario 
        (nome, email, senha, telefone, foto_perfil, cpf, data_nascimento, cidade, nivel_acesso, status_conta, is_admin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.nome,
        dados.email,
        senhaHash,
        dados.telefone,
        dados.foto_perfil,
        dados.cpf,
        dados.data_nascimento,
        dados.cidade,
        dados.nivel_acesso ?? 1,
        dados.status_conta ?? 'ativo',
        dados.is_admin ?? false,
      ]
    );
    return result.insertId;
  },

  // ─── AJUSTADO: Atualização inteligente integrada ao Banco de Dados ───
  async atualizar(id: number, dados: Record<string, any>): Promise<void> {
    // 1. Mapeia a propriedade 'avatar' vinda do controller para a coluna 'foto_perfil' do MySQL
    if ('avatar' in dados) {
      dados.foto_perfil = dados.avatar;
      delete dados.avatar;
    }

    // 2. Se houver biografia (sobreVoce), salvamos na tabela 'prestador' separadamente
    if ('sobreVoce' in dados) {
      const sobreVoce = dados.sobreVoce;
      delete dados.sobreVoce; // Remove para não quebrar a query da tabela usuario

      if (sobreVoce !== undefined) {
        // Atualiza a descrição na tabela do prestador caso ele exista
        await pool.query(
          'UPDATE prestador SET descricao_profissional = ? WHERE id_usuario = ?',
          [sobreVoce, id]
        );
      }
    }

    // 3. Remove campos vazios ou indefinidos para não sobrescrever dados corretos no banco
    Object.keys(dados).forEach((key) => {
      if (dados[key] === undefined || dados[key] === '') {
        delete dados[key];
      }
    });

    // Se restou algum campo para atualizar na tabela 'usuario'
    if (Object.keys(dados).length > 0) {
      const campos = Object.keys(dados).map((k) => `${k} = ?`).join(', ');
      const valores = [...Object.values(dados), id];

      await pool.query(`UPDATE usuario SET ${campos} WHERE id_usuario = ?`, valores);
    }
  },

  async deletar(id: number): Promise<void> {
    await pool.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);
  }
};

export const adminService = {
  async _verificarAdmin(id_solicitante: number): Promise<void> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT is_admin FROM usuario WHERE id_usuario = ?',
      [id_solicitante]
    );

    if (rows.length === 0) {
      throw new Error('Acesso negado: usuário não encontrado');
    }

    if (!rows[0].is_admin) {
      throw new Error('Acesso negado: você não tem permissão de administrador');
    }
  },

  async contarUsuarios(id_solicitante: number) {
    await this._verificarAdmin(id_solicitante);

    const [[totalUsuarios]] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM usuario'
    );

    const [[totalPrestadores]] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM prestador'
    );

    const [[totalComuns]] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM usuario WHERE id_usuario NOT IN (SELECT id_usuario FROM prestador)'
    );

    return {
      total_usuarios: totalUsuarios.total,
      total_prestadores: totalPrestadores.total,
      total_usuarios_comuns: totalComuns.total,
    };
  },

  async listarTodosUsuarios(id_solicitante: number) {
    await this._verificarAdmin(id_solicitante);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        u.id_usuario, u.nome, u.email, u.telefone, u.cidade, u.nivel_acesso, u.status_conta, u.data_criacao, u.is_admin,
        CASE WHEN p.id_usuario IS NOT NULL THEN true ELSE false END AS is_prestador
      FROM usuario u
      LEFT JOIN prestador p ON u.id_usuario = p.id_usuario
      ORDER BY u.data_criacao DESC`
    );

    return rows;
  },

  async listarTodosPrestadores(id_solicitante: number) {
    await this._verificarAdmin(id_solicitante);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        p.id_usuario, u.nome, u.email, u.telefone, u.cidade, u.status_conta, u.data_criacao,
        p.categoria_principal, p.status_verificado, p.status_social, p.impulsiona_perfil, p.descricao_profissional
      FROM prestador p
      INNER JOIN usuario u ON p.id_usuario = u.id_usuario
      ORDER BY u.data_criacao DESC`
    );

    return rows;
  },

  async resumoDashboard(id_solicitante: number) {
    await this._verificarAdmin(id_solicitante);

    const contagem = await this.contarUsuarios(id_solicitante);

    const [[totalSolicitacoes]] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM solicitacaoservico'
    );

    const [[totalAgendas]] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM agenda'
    );

    const [[totalAssinaturasAtivas]] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM assinaturaplano WHERE ativo = true'
    );

    let totalTickets = 0;
    let ticketsPendentes = 0;
    try {
      const [[tTickets]] = await pool.query<RowDataPacket[]>(
        'SELECT COUNT(*) AS total FROM ticketsuporte'
      );
      const [[tPendentes]] = await pool.query<RowDataPacket[]>(
        "SELECT COUNT(*) AS total FROM ticketsuporte WHERE status = 'pendente'"
      );
      totalTickets = tTickets.total;
      ticketsPendentes = tPendentes.total;
    } catch {
      // Tabela opcional
    }

    return {
      usuarios: {
        total: contagem.total_usuarios,
        prestadores: contagem.total_prestadores,
        usuarios_comuns: contagem.total_usuarios_comuns,
      },
      plataforma: {
        total_solicitacoes: totalSolicitacoes.total,
        total_agendas: totalAgendas.total,
        total_assinaturas_ativas: totalAssinaturasAtivas.total,
      },
      suporte: {
        total_tickets: totalTickets,
        tickets_pendentes: ticketsPendentes,
        disponivel: totalTickets > 0,
      },
    };
  },

  async listarTicketsPendentes(id_solicitante: number) {
    await this._verificarAdmin(id_solicitante);

    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT t.*, u.nome AS nome_usuario, u.email AS email_usuario
        FROM ticketsuporte t
        INNER JOIN usuario u ON t.id_usuario = u.id_usuario
        WHERE t.status = 'pendente'
        ORDER BY t.data_criacao ASC`
      );
      return { disponivel: true, tickets: rows };
    } catch {
      return {
        disponivel: false,
        tickets: [],
        mensagem: 'A tabela de tickets de suporte ainda não foi criada',
      };
    }
  },

  async criarUsuario(id_solicitante: number, dados: any): Promise<number> {
    await this._verificarAdmin(id_solicitante);

    const bcryptDynamic = await import('bcryptjs');
    const senhaHash = await bcryptDynamic.hash(dados.senha, 10);

    const [result]: any = await pool.query(
      `INSERT INTO usuario
        (nome, email, senha, cpf, data_nascimento, telefone, foto_perfil, cidade, nivel_acesso, status_conta, is_admin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.nome,
        dados.email,
        senhaHash,
        dados.cpf,
        dados.data_nascimento,
        dados.telefone ?? null,
        dados.foto_perfil ?? null,
        dados.cidade ?? null,
        dados.nivel_acesso ?? 1,
        dados.status_conta ?? 'ativo',
        dados.is_admin ?? false,
      ]
    );

    return result.insertId;
  },

  async atualizarUsuario(id_solicitante: number, id_alvo: number, dados: Record<string, any>): Promise<void> {
    await this._verificarAdmin(id_solicitante);

    const camposBloqueados = ['id_usuario', 'senha', 'data_criacao'];
    camposBloqueados.forEach((c) => delete dados[c]);

    if (Object.keys(dados).length === 0) {
      throw new Error('Nenhum campo válido para atualizar');
    }

    const [existe] = await pool.query<RowDataPacket[]>(
      'SELECT id_usuario FROM usuario WHERE id_usuario = ?',
      [id_alvo]
    );
    if (existe.length === 0) throw new Error('Usuário alvo não encontrado');

    const setClauses = Object.keys(dados).map((k) => `${k} = ?`).join(', ');
    const valores = [...Object.values(dados), id_alvo];

    await pool.query(
      `UPDATE usuario SET ${setClauses} WHERE id_usuario = ?`,
      valores
    );
  },

  async desativarUsuario(id_solicitante: number, id_alvo: number): Promise<void> {
    await this._verificarAdmin(id_solicitante);

    if (id_solicitante === id_alvo) {
      throw new Error('O admin não pode desativar a própria conta');
    }

    const [existe] = await pool.query<RowDataPacket[]>(
      'SELECT id_usuario, status_conta FROM usuario WHERE id_usuario = ?',
      [id_alvo]
    );
    if (existe.length === 0) throw new Error('Usuário não encontrado');
    if (existe[0].status_conta === 'inativo') throw new Error('Usuário já está inativo');

    await pool.query(
      "UPDATE usuario SET status_conta = 'inativo' WHERE id_usuario = ?",
      [id_alvo]
    );
  },

  async reativarUsuario(id_solicitante: number, id_alvo: number): Promise<void> {
    await this._verificarAdmin(id_solicitante);

    const [existe] = await pool.query<RowDataPacket[]>(
      'SELECT id_usuario, status_conta FROM usuario WHERE id_usuario = ?',
      [id_alvo]
    );
    if (existe.length === 0) throw new Error('Usuário não encontrado');
    if (existe[0].status_conta === 'ativo') throw new Error('Usuário já está ativo');

    await pool.query(
      "UPDATE usuario SET status_conta = 'ativo' WHERE id_usuario = ?",
      [id_alvo]
    );
  }
};