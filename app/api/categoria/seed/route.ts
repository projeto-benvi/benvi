import { NextResponse } from "next/server";
import { popularCategoriasIniciais } from "@/service/categoriaService"; 
export async function GET() {
  try {
    const resultado = await popularCategoriasIniciais();
    return NextResponse.json(resultado, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
}