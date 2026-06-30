import pool from '@/app/lib/dataBase';
import { Alerta } from '@/model/alertaModel';

async function garantirTabelaAlerta() {
  await pool.query(
    'CREATE TABLE IF NOT EXISTS alerta (' +
      'id_alerta INT AUTO_INCREMENT PRIMARY KEY,' +
      'id_notificacao INT NOT NULL,' +
      'prioridade INT NOT NULL DEFAULT 1,' +
      'categoria VARCHAR(100) NOT NULL,' +
      "status VARCHAR(40) NOT NULL DEFAULT 'ativo'," +
      'url_acao VARCHAR(255) NULL,' +
      'data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,' +
      'data_expiracao DATETIME NULL,' +
      'data_resolucao DATETIME NULL' +
    ')'
  );

  const [colunas]: any = await pool.query('SHOW COLUMNS FROM alerta');
  const nomes = new Set(colunas.map((coluna: { Field: string }) => coluna.Field));
  if (!nomes.has('status')) await pool.query("ALTER TABLE alerta ADD COLUMN status VARCHAR(40) NOT NULL DEFAULT 'ativo'");
  if (!nomes.has('data_criacao')) await pool.query('ALTER TABLE alerta ADD COLUMN data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP');
  if (!nomes.has('data_resolucao')) await pool.query('ALTER TABLE alerta ADD COLUMN data_resolucao DATETIME NULL');
}

export const alertaService = {
  async criar(alerta: Omit<Alerta, 'id_alerta'> & { status?: string }): Promise<any> {
    await garantirTabelaAlerta();
    const [result]: any = await pool.query(
      'INSERT INTO alerta (id_notificacao, prioridade, categoria, status, url_acao, data_expiracao) VALUES (?, ?, ?, ?, ?, ?)',
      [alerta.id_notificacao, alerta.prioridade, alerta.categoria, alerta.status ?? 'ativo', alerta.url_acao || null, alerta.data_expiracao || null]
    );
    return { id_alerta: result.insertId, status: alerta.status ?? 'ativo', ...alerta };
  },

  async listar(filtros: { id_usuario?: number; status?: string; prioridade?: number; categoria?: string; inicio?: string; fim?: string } = {}): Promise<any[]> {
    await garantirTabelaAlerta();
    const where: string[] = [];
    const valores: any[] = [];
    if (filtros.id_usuario) { where.push('n.id_usuario = ?'); valores.push(filtros.id_usuario); }
    if (filtros.status) { where.push('a.status = ?'); valores.push(filtros.status); }
    if (filtros.prioridade) { where.push('a.prioridade = ?'); valores.push(filtros.prioridade); }
    if (filtros.categoria) { where.push('a.categoria = ?'); valores.push(filtros.categoria); }
    if (filtros.inicio) { where.push('DATE(a.data_criacao) >= ?'); valores.push(filtros.inicio); }
    if (filtros.fim) { where.push('DATE(a.data_criacao) <= ?'); valores.push(filtros.fim); }

    const sql = 'SELECT a.*, n.titulo, n.descricao, n.id_usuario, n.visualizada, n.data_envio ' +
      'FROM alerta a INNER JOIN notificacao n ON a.id_notificacao = n.id_notificacao ' +
      (where.length ? 'WHERE ' + where.join(' AND ') + ' ' : '') +
      "ORDER BY a.status = 'ativo' DESC, a.prioridade DESC, a.data_criacao DESC";
    const [rows]: any = await pool.query(sql, valores);
    return rows;
  },

  async listarAtivos(): Promise<any[]> {
    return this.listar({ status: 'ativo' });
  },

  async buscarPorId(id: number): Promise<any | null> {
    await garantirTabelaAlerta();
    const [rows]: any = await pool.query(
      'SELECT a.*, n.titulo, n.descricao, n.id_usuario FROM alerta a INNER JOIN notificacao n ON a.id_notificacao = n.id_notificacao WHERE a.id_alerta = ?',
      [id]
    );
    return rows[0] ?? null;
  },

  async atualizar(id: number, dados: { prioridade?: number; categoria?: string; status?: string; url_acao?: string; data_expiracao?: string | Date | null }) {
    await garantirTabelaAlerta();
    const permitidos = ['prioridade', 'categoria', 'status', 'url_acao', 'data_expiracao'];
    const sets: string[] = [];
    const valores: any[] = [];
    for (const campo of permitidos) {
      if ((dados as any)[campo] !== undefined) {
        sets.push(campo + ' = ?');
        valores.push((dados as any)[campo]);
      }
    }
    if (dados.status === 'resolvido') sets.push('data_resolucao = NOW()');
    if (!sets.length) return false;
    valores.push(id);
    const [result]: any = await pool.query('UPDATE alerta SET ' + sets.join(', ') + ' WHERE id_alerta = ?', valores);
    return result.affectedRows > 0;
  },

  async deletar(id: number): Promise<boolean> {
    await garantirTabelaAlerta();
    const [result]: any = await pool.query('DELETE FROM alerta WHERE id_alerta = ?', [id]);
    return result.affectedRows > 0;
  }
};
