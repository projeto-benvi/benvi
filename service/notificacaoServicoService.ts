import pool from "@/app/lib/dataBase";
import { NotificacaoServico } from "@/model/notificacaoServico";

export async function listarNotificacoes() {
  const [rows] = await pool.query("SELECT * FROM notificacao_servico ORDER BY data_solicitacao DESC");
  return rows;
}

export async function buscarNotificacaoPorId(id: number) {
  const [rows]: any = await pool.query(
    "SELECT * FROM notificacao_servico WHERE id_notificacao_servico = ?",
    [id]
  );
  return rows[0] ?? null;
}

export async function criarNotificacaoServico(dados: NotificacaoServico) {
  const sql = `
    INSERT INTO notificacao_servico 
      (id_notificacao_fk, id_usuario, descricao, data_solicitacao, status_solicitacao, valor_estimado)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const dataFormatada = dados.data_solicitacao 
    ? dados.data_solicitacao.toISOString().slice(0, 19).replace('T', ' ')
    : new Date().toISOString().slice(0, 19).replace('T', ' ');

  const [result]: any = await pool.query(sql, [
    dados.id_notificacao_fk || null,
    dados.id_usuario,
    dados.descricao,
    dataFormatada,
    dados.status_solicitacao || 'Pendente',
    dados.valor_estimado || 0
  ]);

  return {
    id_notificacao_servico: result.insertId,
    ...dados,
  };
}