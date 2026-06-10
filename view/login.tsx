import Image from "next/image";
import Link from "next/link";
import LogoBranca from "@/assets/logo-branca.png"; 
import carta from "@/assets/icons/carta.svg";
import cadeado from "@/assets/icons/cadeado.svg";
import googleicon from "@/assets/icons/googleicon.svg";
import ilustracao from "@/assets/ilustracao_login.png"; 

export default function Login() {
  return (
    <section className="flex w-full h-screen bg-gradient-to-b from-[#60A5FA] to-[#22C55E] overflow-hidden">
      
      {/* Lado Esquerdo: Logo Branca + Ilustração (Fixado em 55% da tela) */}
      <div className="hidden md:flex flex-col w-[55%] p-12 relative justify-between h-full">
        
        {/* Logo Branca alinhada ao topo esquerdo */}
        <div className="w-full flex justify-start items-center pl-6 pt-2">
          <Image 
            src={LogoBranca} 
            alt="Logo Benvi" 
            width={150} 
            height={50} 
            priority
          />
        </div>

        {/* Container da Ilustração (Grande e centralizado sem esmagar o form) */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[800px] aspect-square relative">
            <Image 
              src={ilustracao} 
              alt="Ilustração Benvi" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        {/* Espaçador inferior */}
        <div className="h-6 hidden lg:block"></div>
      </div>

      {/* Lado Direito: Painel do Formulário (Expandido e fixado em 45% da tela) */}
      <div className="w-full md:w-[45%] bg-white rounded-tl-[60px] md:rounded-tl-[100px] flex flex-col justify-between p-8 md:p-16 h-full shadow-2xl z-10">
        
        {/* Botão de Voltar discreto no topo */}
        <div className="flex items-center justify-start pt-2">
          <button className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
            <span className="text-xl font-medium">&lt;</span>
          </button>
        </div>

        {/* Bloco Central: Títulos e Formulário (Aumentado o max-w para dar mais espaço aos inputs) */}
        <div className="w-full max-w-[420px] mx-auto my-auto">
          <div className="text-center mb-10">
            <h1 className="text-[34px] font-bold text-[#1E293B] mb-2 tracking-tight">
              Bem-vindo de volta
            </h1>
            <p className="text-gray-400 text-sm">
              Faça login para continuar
            </p>
          </div>

          {/* Formulário */}
          <form className="flex flex-col gap-5">
            
            {/* Input Email */}
            <div className="relative">
              <Image
                src={carta}
                alt="Email"
                width={20}
                height={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
              />
              <input
                type="email"
                placeholder="seuemail@gmail.com"
                className="bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-4 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-400 font-normal text-sm"
              />
            </div>

            {/* Input Senha */}
            <div className="relative">
              <Image
                src={cadeado}
                alt="Senha"
                width={20}
                height={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
              />
              <input
                type="password"
                placeholder="Sua senha"
                className="bg-[#EFEFEF] text-gray-800 rounded-xl pl-12 pr-4 py-4 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-400 font-normal text-sm"
              />
            </div>

            {/* Esqueceu a senha */}
            <div className="text-right -mt-3">
              <Link href="/recuperar-senha" className="text-[11px] text-gray-400 hover:underline">
                Esqueceu a senha?
              </Link>
            </div>

            {/* Botão Entrar */}
            <button 
              type="submit" 
              className="bg-[#F97316] text-white font-semibold rounded-xl py-4 mt-2 cursor-pointer hover:bg-[#EA580C] transition-colors text-base shadow-md shadow-orange-500/10"
            >
              Entrar
            </button>

            {/* Divisor "ou" */}
            <div className="flex items-center gap-4 my-1">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-sm font-normal">ou</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Botão Google */}
            <button 
              type="button" 
              className="bg-[#EFEFEF] text-gray-700 font-medium rounded-xl py-3.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors text-sm"
            >
              <Image src={googleicon} alt="Google" width={18} height={18} />
              Entrar com Google
            </button>
          </form>

          {/* Link para criar conta */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <span>É novo por aqui? </span>
            <Link href="/cadastro" className="text-[#3B82F6] font-semibold hover:underline">
              Criar uma conta
            </Link>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center text-[11px] text-gray-400 space-y-1 pb-2">
          <p className="hover:underline cursor-pointer">Política de Privacidade - Termos</p>
          <p>© 2026 Benvi</p>
        </div>

      </div>
    </section>
  );
}