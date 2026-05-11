import Image from "next/image";
import logo from "@/assets/logo Benvi1.png"
import iconCadeado from "@/assets/icons/iconCadeado.svg"
import iconCarta from "@/assets/icons/iconCarta.svg"
import iconCpf from "@/assets/icons/iconCpf.svg"
import iconPessoa from "@/assets/icons/iconPessoa.svg"
import iconTelefone from "@/assets/icons/iconTelefone.svg"
import Link from "next/link";

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
          <p className="max-w-md font-bold text-sm leading-8 text-zinc-600 dark:text-zinc-400">
            Comece criando sua conta
           
          </p>

            {/* Inputs: */}
            {/* Nome id =  nome*/}
          <div className="relative w-full">
            
            <Image src={iconPessoa} alt="icone pessoa" width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2"/>
            
            <input id="nome" type="text" placeholder="Seu nome completo" className="border border-gray-300 rounded-md px-4 py-2 w-full pl-10"/>
          </div>

          {/* email id = email */}
          <div className="relative w-full">
            
            <Image src={iconCarta} alt="icone pessoa" width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2"/>
            
            <input id="email" type="text" placeholder="seuemail@gmail.com" className="border border-gray-300 rounded-md px-4 py-2 w-full pl-10"/>
          </div>

          {/* CPF id= cpf*/}
          <div className="relative w-full">
            
            <Image src={iconCpf} alt="icone pessoa" width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2"/>
            
            <input id="cpf" type="text" placeholder="CPF: 000.000.000-00" className="border border-gray-300 rounded-md px-4 py-2 w-full pl-10"/>
          </div>

          {/* Celular id= celular */}
          <div className="relative w-full">
            
            <Image src={iconTelefone} alt="icone pessoa" width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2"/>
            
            <input id="celular" type="text" placeholder="(00)0000-0000" className="border border-gray-300 rounded-md px-4 py-2 w-full pl-10"/>
          </div>

          {/* Senha id= senha */}
          <div className="relative w-full">
            
            <Image src={iconCadeado} alt="icone pessoa" width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2"/>
            
            <input id="senha" type="text" placeholder="Senha segura" className="border border-gray-300 rounded-md px-4 py-2 w-full pl-10"/>
          </div>

          {/* Botão cadastrar. id = btnCadastrar */}
          <button id= "btnCadastrar" className="rounded-md px-4 py-2 w-full pl-10 bg-orange-400 text-white hover:bg-orange-500 transition text-xl">  Cadastrar </button>



          <p className="max-w-md text-sm leading- text-zinc-600 dark:text-zinc-400">
            Já tem sua conta?{"    "}
            <Link href="/login" className="text-blue-500 hover:underline">    Entrar  </Link>
          </p>

          <p className="max-w-md text-sm leading-8 text-zinc-600 dark:text-zinc-400">
            Política de privacidade - {" "}
            <Link href="/termosPrivacidade" className="text-blue-500 hover:underline">    Termos  </Link>
          </p>

           <p className="max-w-md text-sm leading-1 text-zinc-600 dark:text-zinc-400">
            © 2026 Benvi
          </p>




        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          
         
        </div>
      </main>
    </div>
  );
}
