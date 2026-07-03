import { NextResponse } from "next/server";
import { popularCategoriasIniciais } from "@/service/categoriaService"; 
import { authErrorResponse, requireAdmin } from "@/app/lib/authz";
export async function GET() {
  try {
    await requireAdmin();
    const resultado = await popularCategoriasIniciais();
    return NextResponse.json(resultado, { status: 200 });
  } catch (error: any) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
}
