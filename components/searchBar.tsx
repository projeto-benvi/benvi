import Form from "next/form"
import Image from "next/image"

import iconSearch from "@/assets/icons/search.svg"
import iconFilter from "@/assets/icons/filter-alt-2.svg"
import user from "@/assets/user.png"
import iconNotification from "@/assets/icons/notification.svg"
import iconPerfil from "@/assets/comSearchBar/nft-profile.svg"
import iconConfig from "@/assets/comSearchBar/iconConfig.svg"

export default function SearchBar() {

    return (
        <div>
            <form action="" className="border-b-gray-200 border-b-2 h-18 flex items-center justify-between px-10 p-2 pl-20">

                <div className="flex  border-2 border-gray-200 rounded-2xl h-12 shadow-md">
                    <Image
                        className="px-2"
                        src={iconSearch}
                        alt={"icon Search"}

                    />
                    <input type="text" className="border-r-2 border-gray-200 w-150" />
                    <Image
                        className="px-2"
                        src={iconFilter}
                        alt={"icon Filter"}

                    />
                </div>

                <div className="flex">
                    <Image
                        src={iconNotification}
                        alt="icon notificação"
                        width={40}
                        className="pb-7 px-2"
                    />
                    <div>
                        <p>Olá, Pedro</p>
                        <p className="text-sm text-[#1F2937] text-right hover:text-[#2563EB] cursor-pointer">Cliente</p>
                    </div>

                    <Image
                        className="px-2"
                        src={user}
                        alt={"Foto usuario"}
                        width={70}
                        height={50}

                    />

                    <div >

                        <details className="relative inline-block text-left">

                            <summary className="flex items-center cursor-pointer list-none text-2xl px-4 py-2 rounded-md transition rotate-90 hover:rotate-270">
                                &#x27A4;    
                            </summary>

                            <ul className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                                <li>
                                    <a href="#" className="flex px-4 py-2 text-gray-700 hover:bg-gray-100 border-b border-gray-100 last:border-0">
                                        <Image
                                            src={iconPerfil}
                                            alt="icon perfil"
                                            className="pr-2"
                                            width={30}
                                        />
                                        Meu perfil
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex px-4 py-2 text-gray-700 hover:bg-gray-100">
                                        <Image
                                            src={iconConfig}
                                            alt="icon configurações"
                                            className="pr-2"
                                            width={28}
                                        />
                                        Configurações
                                    </a>
                                </li>
                            </ul>
                        </details>
                    </div>

                </div>
            </form>
        </div>
    )
}