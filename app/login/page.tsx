import Image from "next/image";
import Logo from "@/assets/benvi colorido 2.svg";
import Link from "next/link";
import carta from "@/assets/carta.svg";
import cadeado from "@/assets/cadeado.svg";
import googleicon from "@/assets/googleicon.svg";


export default function Login() {
  return (
    <section className="flex bg-gradient-to-b from-[#2563EB] to-[#16A341] w-full h-screen items-center justify-center">
        <div className="flex flex-col bg-white rounded-2xl shadow-xl pt-13 pb-2 pl-13 pr-13 w-110"> {/* Caixa contendo o form e a desc */}
            
            <div className="flex flex-col items-center justify-center mb-6 mt-1"> {/* Logo da Benvi e pedido de login */}
                <Image src={Logo} alt="Logo da Benvi" className="mb-3" />   
                    <h1 className="text-2xl font-semibold mb-1 mt-2 items-center justify-center">
                        Bem-vindo de volta!
                    </h1>
                    <p className="text-gray-600 mb-4 ">
                        Faça login para continuar.
                    </p>    
            </div>

            <div> {/*Formulário de login*/} 
                <form className="flex flex-col gap-4">
                <div className="relative">
                    <Image
                        src={carta}
                        alt="Email"
                        width={18}
                        height={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
            />

                <input
                type="email"
                placeholder="seuemail@exemplo.com"
                className="border border-gray-300 rounded px-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>
                <div className="relative">
                    <Image
                        src={cadeado}
                        alt="Senha"
                        width={18}
                        height={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
            />

            <input
                type="password"
                placeholder="sua senha"
                className="border border-gray-300 rounded px-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>
                    <button type="submit" className="bg-[#F97316] text-white rounded px-3 py-2 cursor-pointer hover:bg-[#EA580C] transition-colors">
                        Entrar
                    </button>
                        <div className="flex items-center gap-4 mt-0">
                            <div className="flex-1 h-px bg-[rgb(100,100,100)]"></div>
                                <span className="[rgb(100,100,100)] text-sm">ou</span>
                            <div className="flex-1 h-px bg-[rgb(100,100,100)]"></div>
                        </div>
                    <button type="button" className="bg-[rgb(179,208,255)] text-black font-semibold border-gray-300 rounded px-3 py-2 cursor-pointer hover:bg-[rgb(130,170,230)] transition-colors">
                        <Image src={googleicon} alt="Google" width={18} height={18} className="inline-block mr-2" />
                        Entrar com o Google
                    </button>
                </form>
            </div>

                <div className="flex flex-col items-center justify-center mt-2 mb-20"> {/* Link para cadastro */}
                    <p>É novo por aqui?

                    <Link href="/cadastro" className="text-[hsl(221,90%,70%)] font-semibold ml-1 hover:underline">
                        Cadastre-se
                    </Link>
                    </p>
                </div>
            

        <p className="text-center text-gray-500 text-sm mt-4 text-0.1xl">
                Política de Privacidade - Termos
                © 2026 Benvi
        </p>

        </div>


    </section>  
  )
}