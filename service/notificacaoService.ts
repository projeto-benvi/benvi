import pool from '@/app/lib/dataBase'; 
import { Notificacao } from '@/model/notificacaoModel';

async function garantirTabelaNotificacao() {
  await pool.query(
    'CREATE TABLE IF NOT EXISTS notificacao (' +
      'id_notificacao INT AUTO_INCREMENT PRIMARY KEY,' +
      'id_usuario INT NOT NULL,' +
      'titulo VARCHAR(255) NOT NULL,' +
      'descricao TEXT NOT NULL,' +
      'visualizada TINYINT(1) DEFAULT 0,' +
      'url_acao VARCHAR(255) NULL,' +
      'tipo VARCHAR(80) NULL,' +
      'data_envio DATETIME DEFAULT CURRENT_TIMESTAMP' +
    ')'
  );

  const [colunas]: any = await pool.query('SHOW COLUMNS FROM notificacao');
  const nomes = new Set(colunas.map((coluna: { Field: string }) => coluna.Field));
  if (!nomes.has('url_acao')) await pool.query('ALTER TABLE notificacao ADD COLUMN url_acao VARCHAR(255) NULL');
  if (!nomes.has('tipo')) await pool.query('ALTER TABLE notificacao ADD COLUMN tipo VARCHAR(80) NULL');
}

type NovaNotificacao = Omit<Notificacao, 'id_notificacao' | 'visualizada' | 'data_envio'> & {
  url_acao?: string | null;
  tipo?: string | null;
};

export const notificacaoService = {
  async criar(notificacao: NovaNotificacao): Promise<any> {
    await garantirTabelaNotificacao();
    const [result]: any = await pool.query(
      'INSERT INTO notificacao (id_usuario, titulo, descricao, url_acao, tipo) VALUES (?, ?, ?, ?, ?)',
      [notificacao.id_usuario, notificacao.titulo, notificacao.descricao, notificacao.url_acao ?? null, notificacao.tipo ?? null]
    );
    return { id_notificacao: result.insertId, ...notificacao, visualizada: false };
  },

  async listarPorUsuario(idUsuario: number): Promise<any[]> {
    await garantirTabelaNotificacao();
    const [rows]: any = await pool.query(
      'SELECT * FROM notificacao WHERE id_usuario = ? ORDER BY visualizada ASC, data_envio DESC',
      [idUsuario]
    );
    return rows;
  },

  async buscarPorId(id: number): Promise<any | null> {
    await garantirTabelaNotificacao();
    const [rows]: any = await pool.query('SELECT * FROM notificacao WHERE id_notificacao = ?', [id]);
    return rows[0] ?? null;
  },

  async marcarComoVisualizada(id: number): Promise<boolean> {
    await garantirTabelaNotificacao();
    const [result]: any = await pool.query('UPDATE notificacao SET visualizada = true WHERE id_notificacao = ?', [id]);
    return result.affectedRows > 0;
  },

  async deletar(id: number): Promise<boolean> {
    await garantirTabelaNotificacao();
    const [result]: any = await pool.query('DELETE FROM notificacao WHERE id_notificacao = ?', [id]);
    return result.affectedRows > 0;
  }
};
