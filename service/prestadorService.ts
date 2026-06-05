import pool from '@/app/lib/dataBase';
import { Prestador } from '@/model/prestador';

export const prestadorService = {

  async listarTodos() {
    const [rows] = await pool.query(
      `SELECT p.*, u.nome, u.email, u.telefone, u.foto_perfil, u.cidade, u.status_conta
       FROM prestador p
       INNER JOIN usuario u ON p.id_usuario = u.id_usuario`
    );
    return rows;
  },

  async buscarPorId(id: number) {
    const [rows]: any = await pool.query(
      `SELECT p.*, u.nome, u.email, u.telefone, u.foto_perfil, u.cidade, u.status_conta
       FROM prestador p
       INNER JOIN usuario u ON p.id_usuario = u.id_usuario
       WHERE p.id_usuario = ?`, [id]
    );
    return rows[0] ?? null;
  },

  async buscarPorIdUsuario(id_usuario: number) {
    const [rows]: any = await pool.query(
      `SELECT p.*, u.nome, u.email, u.telefone, u.foto_perfil, u.cidade, u.status_conta
       FROM prestador p
       INNER JOIN usuario u ON p.id_usuario = u.id_usuario
       WHERE p.id_usuario = ?`, [id_usuario]
    );
    return rows[0] ?? null;
  },

  async criar(dados: Prestador): Promise<number> {
  await pool.query(
    `INSERT INTO prestador 
    (id_usuario, descricao_profissional, status_verificado, status_social, impulsiona_perfil, categoria_principal) 
    VALUES (?, ?, ?, ?, ?, ?)` ,
    [
      dados.id_usuario,
      dados.descricao_profissional ?? null,
      dados.status_verificado ?? false,
      dados.status_social ?? 'ativo',
      dados.impulsiona_perfil ?? false,
      dados.categoria_principal ?? null
    ]
  );
  return dados.id_usuario!
},

async atualizar(id: number, dados: Partial<Prestador>): Promise<void> {
  // 1. Lista estrita de campos que realmente existem na tabela prestador
  const camposPermitidos = [
    'descricao_profissional',
    'status_verificado',
    'status_social',
    'impulsiona_perfil',
    'categoria_principal'
  ];

  // 2. Filtra o objeto 'dados' para pegar apenas o que pertence ao prestador
  const camposParaAtualizar: string[] = [];
  const valores: any[] = [];

  camposPermitidos.forEach(campo => {
    if (dados[campo as keyof Partial<Prestador>] !== undefined) {
      camposParaAtualizar.push(`${campo} = ?`);
      valores.push(dados[campo as keyof Partial<Prestador>]);
    }
  });

  // Se nenhum campo válido de prestador foi enviado para atualizar, interrompe aqui
  if (camposParaAtualizar.length === 0) return;

  // 3. Adiciona o ID no final do array de valores para o WHERE
  valores.push(id);

  const sql = `UPDATE prestador SET ${camposParaAtualizar.join(', ')} WHERE id_usuario = ?`;
  
  await pool.query(sql, valores);
},

  async deletar(id: number): Promise<void> {
    await pool.query(
      'DELETE FROM prestador WHERE id_usuario = ?', [id]
    );
  }
};