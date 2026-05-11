import Image from "next/image";
import logo from "@/assets/logo Benvi.png"
import iconCadeado from "@/assets/icons/iconCadeado.svg"
import iconCarta from "@/assets/icons/iconCarta.svg"
import iconCpf from "@/assets/icons/iconCpf.svg"
import iconPessoa from "@/assets/icons/iconPessoa.svg"
import iconTelefone from "@/assets/icons/iconTelefone.svg"

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-blue-500 to-green-500 h-screen">
      <main className="min-h-screen bg-gradient-to-b from-blue-500 to-green-500 flex items-center justify-center">
       
        <div className="bg-white dark:bg-black p-10 rounded-2xl shadow-lg w-full max-w-md text-center flex flex-col items-center gap-2">
        <Image
          className="dark:invert"
          src={logo}
          alt="Logo da benvi"
          width={200}
          height={50}
          priority
        />
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Crie sua conta
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Comece criando sua conta{" "}
           
          </p>

          <input className="border border-gray-300 rounded-md px-4 py-2 w-full" type="text" id="nome" placeholder="👤Digite seu nome completo" ></input>
          <input className="border border-gray-300 rounded-md px-4 py-2 w-full" type="text" id="email" placeholder="✉️Digite seu email ex@gmail.com" ></input>
          <input className="border border-gray-300 rounded-md px-4 py-2 w-full" type="text" id="cpfUsuario" placeholder="🪪Seu CPF: 000.000.000-00" ></input>
          <input className="border border-gray-300 rounded-md px-4 py-2 w-full" type="text" id="celular" placeholder="✆ Celular (00) 00000-0000" ></input>
          <input className="border border-gray-300 rounded-md px-4 py-2 w-full" type="text" id="senha" placeholder="🔒Digite sua senha" ></input>
          <button className="bg-orange-400 text-white px-6 py-2 rounded-md hover:bg-orange-500 transition">  Cadastrar </button>




        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          
         
        </div>
      </main>
    </div>
  );
}
