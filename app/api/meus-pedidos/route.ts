import { NextResponse } from "next/server";
import pool from "@/app/lib/dataBase";
import { authErrorResponse, requireUser } from "@/app/lib/authz";

export async function GET(request: Request) {
  try {
    const user = await requireUser();

    // 2. Query SQL que junta os dados da solicitação com o Nome e Foto do Prestador (tabela usuario)
    const sql = `
      SELECT 
        s.id_solicitacao,
        s.id_usuario,
        s.id_prestador,
        s.endereco,
        s.data_solicitacao,
        s.data_agendamento,
        s.status,
        s.descricao_servico,
        s.complemento,
        u.nome AS prestador_nome,
        u.foto_perfil AS prestador_foto,
        u.telefone AS prestador_telefone
      FROM solicitacaoservico s
      JOIN usuario u ON s.id_prestador = u.id_usuario
      WHERE s.id_usuario = ?
      ORDER BY s.data_solicitacao DESC
    `;

    // 3. Executa a busca passando o ID de forma segura contra SQL Injection
    const [rows] = await pool.query(sql, [user.id]);

    // Retorna a lista de serviços encontrados
    return NextResponse.json(rows);
  } catch (error: any) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    console.error("Erro na API /api/meus-pedidos:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao buscar serviços contratados." }, 
      { status: 500 }
    );
  }
}
