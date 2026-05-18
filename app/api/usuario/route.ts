import pool from "@/app/lib/dataBase";
import { watch } from "fs";
import { NextResponse } from "next/server";

async function testeConecxao() {
    try{
        const [rows] = await pool.query("SELECT 1+1 AS resultado");
        console.log("conexão estabelecida com sucesso! Resultado do teste:", rows)
    } catch (erro){
        console.error("Erro ao conectar no banco de dados:", erro);
    }
    
}

testeConecxao()

let usuarios = [
    { id: 1, nome: "joao", idade: "21", email: "jv@gmail.com" },
    { id: 2, nome: "igor", idade: "28", email: "igor@gmail.com" }
]

export async function GET() {
    return NextResponse.json(usuarios);
}
