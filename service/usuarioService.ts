import pool from '@/app/lib/dataBase';
import { Usuario } from '@/model/usuario';
import bcrypt from 'bcryptjs';

export const usuarioService = {

  // Busca todos os usuários (sem retornar a senha)
  async listarTodos(): Promise<Usuario[]> {
    const [rows] = await pool.query(
      'SELECT id_usuario, nome, email, telefone, cidade, nivel_acesso, status_conta, data_criacao, is_admin FROM usuario'
    );
    return rows as Usuario[];
  },

  // Busca um usuário pelo id
  async buscarPorId(id: number): Promise<Usuario | null> {
    const [rows]: any = await pool.query(
      'SELECT * FROM usuario WHERE id_usuario = ?', [id]
    );
    return rows[0] ?? null;
  },

  // Cria um novo usuário (criptografa a senha)
  async criar(dados: Omit<Usuario, 'id_usuario'>): Promise<number> {
    console.log('Criando usuário com dados:', dados); // Log para depuração
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
        dados.is_admin ?? false
      ]
    );
    return result.insertId;
  },

  // Atualiza dados do usuário
  async atualizar(id: number, dados: Partial<Usuario>): Promise<void> {
    const campos = Object.keys(dados).map(k => `${k} = ?`).join(', ');
    const valores = [...Object.values(dados), id];
    await pool.query(
      `UPDATE usuario SET ${campos} WHERE id_usuario = ?`, valores
    );
  },

  // Deleta um usuário
  async deletar(id: number): Promise<void> {
    await pool.query(
      'DELETE FROM usuario WHERE id_usuario = ?', [id]
    );
  }
};