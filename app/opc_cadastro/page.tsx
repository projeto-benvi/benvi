import Image from "next/image";
import Logo from "@/assets/benvi colorido 2.svg";
import user from "@/assets/usuario.svg"
import ferr from "@/assets/ferramenta.svg"

//<button className="text-3xl justify-start items-start">&lt;</button>
export default function opcoesCadastro() {
    return (
        <main className="flex bg-gradient-to-b from-[#2563EB] to-[#16A341] w-full h-screen items-center justify-center">
            
            <div className="flex flex-col bg-white rounded-2xl p-2 pt-5 px-20 items-center justify-center">
                
                <div className="flex items- justify-end">
                    
                    <Image
                        className=""
                        src={Logo} 
                        width={300}
                        alt={"Logo do projeto"}                
                    />
                </div>
                
                <h1 className="font-bold text-6xl text-[#1F2937] mb-10">Como você deseja usar o Benvi ?</h1>
                <div className="flex p-2 m-5 mb-20">

                    <div className="flex flex-col p-2 bg-[#F5F5F5] rounded-2xl items-center justify-center mr-20 shadow-md ">
                        <Image
                            className="m-7 "
                            src={user}
                            alt="logo Usuario"
                        />
                        <h1 className="font-bold text-2xl mb-1">Quero contratar um serviço</h1>
                        <p className="align-middle text-2xl mb-5" >Encontre profissionais<br />confiáveis perto de você.</p>
                        <button className="cursor-pointer bg-[#16A341] text-white p-2 rounded-2xl font-bold px-10 py-2 text-3xl mb-2">Sou cliente</button>
                    </div>

                    <div className="flex flex-col p-2 bg-[#F5F5F5] rounded-2xl items-center justify-center ml-20 shadow-md">
                        <Image 
                            src={ferr} 
                            alt="logo Usuario"                         
                        />
                        <h1 className="font-bold text-2xl mb-1">Quero oferecer um serviço</h1>
                        <p className="align-middle text-2xl mb-5">Encontre clientes e gerencie<br />seus serviços em um só lugar</p>
                        <button className="cursor-pointer bg-[#2563EB] text-white p-2 rounded-2xl font-bold px-10 py-2 text-3xl mb-2">Sou prestador</button>
                        
                    </div>
                </div>
            </div>

        </main>
    )
}