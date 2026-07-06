import pool from '@/app/lib/dataBase';
import { Usuario } from '@/model/usuario';
import bcrypt from 'bcryptjs';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

function logErroSqlAtualizacaoUsuario(error: unknown, contexto: Record<string, unknown>) {
  const erro = error as { name?: string; code?: string; errno?: number; sqlState?: string; message?: string; stack?: string };

  console.error('Erro SQL ao atualizar usuário.', {
    tipo: erro?.name ?? typeof error,
    codigo: erro?.code,
    errno: erro?.errno,
    sqlState: erro?.sqlState,
    mensagem: erro?.message,
    stack: erro?.stack,
    ...contexto,
  });
}

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
  try {
    if (!dados.nome || !dados.email) {
      throw new Error('Campos obrigatórios ausentes para criar usuário.');
    }

    const senhaHash = dados.senha ? await bcrypt.hash(dados.senha, 10) : '';
    const [result]: any = await pool.query(
      `INSERT INTO usuario 
        (nome, email, senha, telefone, foto_perfil, cpf, data_nascimento, cidade, nivel_acesso, status_conta, is_admin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.nome,
        dados.email,
        senhaHash,
        dados.telefone ?? null,
        dados.foto_perfil ?? null,
        dados.cpf ?? null,
        dados.data_nascimento ?? null,
        dados.cidade ?? null,
        1,
        'ativo',
        false,
      ]
    );
    return result.insertId;
  } catch (e) {
    const erro = e as { name?: string; code?: string; errno?: number; message?: string };
    console.error("Erro SQL ao criar usuário.", {
      tipo: erro?.name ?? typeof e,
      codigo: erro?.code,
      errno: erro?.errno,
      mensagem: erro?.message,
    });
    throw e;
  }
},

  // ─── AJUSTADO: Atualização inteligente integrada ao Banco de Dados ───
  async atualizar(id: number, dados: Record<string, any>): Promise<void> {
    const camposUsuarioPermitidos = new Set([
      'nome',
      'telefone',
      'cidade',
      'foto_perfil',
      'data_nascimento',
    ]);

    // 1. Mapeia propriedades vindas do controller/frontend para colunas reais do MySQL
    if ('avatar' in dados) {
      dados.foto_perfil = dados.avatar;
      delete dados.avatar;
    }

    if ('dataNascimento' in dados) {
      dados.data_nascimento = dados.dataNascimento;
      delete dados.dataNascimento;
    }

    // 2. Se houver biografia (sobreVoce), salvamos na tabela 'prestador' separadamente
    if ('sobreVoce' in dados) {
      const sobreVoce = dados.sobreVoce;
      delete dados.sobreVoce; // Remove para não quebrar a query da tabela usuario

      if (sobreVoce !== undefined) {
        // Atualiza a descrição na tabela do prestador caso ele exista
        const sqlPrestador = 'UPDATE prestador SET descricao_profissional = ? WHERE id_usuario = ?';

        try {
          await pool.query(sqlPrestador, [sobreVoce, id]);
        } catch (error) {
          logErroSqlAtualizacaoUsuario(error, {
            etapa: 'prestador.descricao_profissional',
            camposRecebidos: ['sobreVoce'],
            sql: sqlPrestador,
            quantidadeParametros: 2,
          });
          throw error;
        }
      }
    }

    // 3. Remove campos vazios ou indefinidos para não sobrescrever dados corretos no banco
    Object.keys(dados).forEach((key) => {
      if (dados[key] === undefined || dados[key] === '') {
        delete dados[key];
      }
    });

    Object.keys(dados).forEach((key) => {
      if (!camposUsuarioPermitidos.has(key)) {
        delete dados[key];
      }
    });

    // Se restou algum campo para atualizar na tabela 'usuario'
    if (Object.keys(dados).length > 0) {
      const campos = Object.keys(dados).map((k) => `${k} = ?`).join(', ');
      const valores = [...Object.values(dados), id];
      const sqlUsuario = `UPDATE usuario SET ${campos} WHERE id_usuario = ?`;

      try {
        await pool.query(sqlUsuario, valores);
      } catch (error) {
        logErroSqlAtualizacaoUsuario(error, {
          etapa: 'usuario',
          camposRecebidos: Object.keys(dados),
          sql: sqlUsuario,
          quantidadeParametros: valores.length,
          quantidadePlaceholders: (sqlUsuario.match(/\?/g) ?? []).length,
        });
        throw error;
      }
    }
  },

  async deletar(id: number): Promise<void> {
    await pool.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);
  },

  async excluirPropriaConta(idUsuario: number, dados: { fraseConfirmacao?: unknown; senhaAtual?: unknown }): Promise<void> {
    const frase = typeof dados.fraseConfirmacao === 'string' ? dados.fraseConfirmacao.trim() : '';
    const senhaAtual = typeof dados.senhaAtual === 'string' ? dados.senhaAtual : '';

    if (frase !== 'EXCLUIR MINHA CONTA') {
      throw new Error('CONFIRMACAO_INVALIDA');
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [usuarios] = await connection.query<RowDataPacket[]>(
        'SELECT id_usuario, senha, is_admin, status_conta FROM usuario WHERE id_usuario = ? FOR UPDATE',
        [idUsuario]
      );
      const usuario = usuarios[0];

      if (!usuario) throw new Error('USUARIO_NAO_ENCONTRADO');
      if (String(usuario.status_conta).toLowerCase() === 'excluido') throw new Error('CONTA_JA_EXCLUIDA');

      if (Boolean(usuario.is_admin)) {
        const [admins] = await connection.query<RowDataPacket[]>(
          "SELECT COUNT(*) AS total FROM usuario WHERE is_admin = true AND status_conta = 'ativo' AND deleted_at IS NULL"
        );
        if (Number(admins[0]?.total ?? 0) <= 1) throw new Error('ULTIMO_ADMIN');
      }

      const senhaHash = String(usuario.senha ?? '');
      if (senhaHash.length > 0) {
        const senhaVaziaValida = await bcrypt.compare('', senhaHash).catch(() => false);
        if (!senhaVaziaValida) {
          if (!senhaAtual) throw new Error('SENHA_OBRIGATORIA');
          const senhaCorreta = await bcrypt.compare(senhaAtual, senhaHash);
          if (!senhaCorreta) throw new Error('SENHA_INVALIDA');
        }
      }

      await connection.query(
        `UPDATE usuario
            SET status_conta = 'excluido',
                deleted_at = NOW(),
                deleted_by_user = true,
                motivo_exclusao = ?,
                telefone = NULL,
                foto_perfil = NULL,
                cidade = NULL
          WHERE id_usuario = ?`,
        ['solicitacao_do_usuario', idUsuario]
      );

      await connection.query(
        `UPDATE prestador
            SET status_social = 'excluido',
                status_verificado = false,
                impulsiona_perfil = false
          WHERE id_usuario = ?`,
        [idUsuario]
      );

      await connection.query(
        "UPDATE servico SET status_servico = 'inativo' WHERE id_prestador = ? AND LOWER(status_servico) NOT IN ('concluido', 'concluído')",
        [idUsuario]
      );

      await connection.query(
        "UPDATE agenda SET status = 'cancelado' WHERE id_prestador = ? AND LOWER(status) NOT IN ('cancelado', 'concluido', 'concluído')",
        [idUsuario]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      const err = error as { name?: string; code?: string; message?: string };
      console.error('Erro seguro ao excluir propria conta.', {
        tipo: err?.name ?? typeof error,
        codigo: err?.code,
        mensagem: err?.message,
        idUsuario,
      });
      throw error;
    } finally {
      connection.release();
    }
  }
};

export const adminService = {
  async _verificarAdmin(id_solicitante: number): Promise<void> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT is_admin, status_conta, deleted_at FROM usuario WHERE id_usuario = ?',
      [id_solicitante]
    );

    if (rows.length === 0) {
      throw new Error('Acesso negado: usuário não encontrado');
    }

    if (!rows[0].is_admin || String(rows[0].status_conta).toLowerCase() !== 'ativo' || rows[0].deleted_at) {
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
        false,
      ]
    );

    return result.insertId;
  },

  async atualizarUsuario(id_solicitante: number, id_alvo: number, dados: Record<string, any>): Promise<void> {
    await this._verificarAdmin(id_solicitante);

    const camposPermitidos = new Set([
      'nome',
      'email',
      'telefone',
      'foto_perfil',
      'cidade',
      'nivel_acesso',
      'status_conta',
      'data_nascimento',
    ]);

    dados = Object.fromEntries(
      Object.entries(dados).filter(([campo]) => camposPermitidos.has(campo))
    );

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

  async alterarPermissaoAdministrador(id_solicitante: number, id_alvo: number, tornarAdmin: boolean): Promise<{ is_admin: boolean }> {
    await this._verificarAdmin(id_solicitante);

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [alvos] = await connection.query<RowDataPacket[]>(
        'SELECT id_usuario, is_admin, status_conta FROM usuario WHERE id_usuario = ? FOR UPDATE',
        [id_alvo]
      );
      const alvo = alvos[0];

      if (!alvo) throw new Error('USUARIO_NAO_ENCONTRADO');

      if (!tornarAdmin && Boolean(alvo.is_admin)) {
        const [admins] = await connection.query<RowDataPacket[]>(
          "SELECT COUNT(*) AS total FROM usuario WHERE is_admin = true AND status_conta = 'ativo' AND deleted_at IS NULL"
        );
        if (Number(admins[0]?.total ?? 0) <= 1) throw new Error('ULTIMO_ADMIN');
      }

      await connection.query<ResultSetHeader>(
        'UPDATE usuario SET is_admin = ? WHERE id_usuario = ?',
        [tornarAdmin, id_alvo]
      );

      await connection.query(
        'INSERT INTO admin_auditoria (id_admin, id_usuario_afetado, acao) VALUES (?, ?, ?)',
        [id_solicitante, id_alvo, tornarAdmin ? 'promover_admin' : 'remover_admin']
      );

      await connection.commit();

      return { is_admin: tornarAdmin };
    } catch (error) {
      await connection.rollback();
      const err = error as { name?: string; code?: string; message?: string };
      console.error('Erro seguro ao alterar permissao administrativa.', {
        tipo: err?.name ?? typeof error,
        codigo: err?.code,
        mensagem: err?.message,
        idAdmin: id_solicitante,
        idUsuarioAfetado: id_alvo,
      });
      throw error;
    } finally {
      connection.release();
    }
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

