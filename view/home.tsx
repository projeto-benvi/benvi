"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SearchBar from "@/components/searchBar";
import CardFundoAzul from "@/components/CardFundoAzul";
import CategoriasPopulares from "@/components/home/CategoriasPopulares";
import ProfissionaisRecomendados from "@/components/home/profissionaisRecomendados";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const user = session.user as any;
      if (user.isPrestador) {
        router.push("/inicialPrestador");
      }
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Carregando...</p>
      </div>
    );
  }

  const user = session?.user as any;
  if (user?.isPrestador) {
    return null;
  }

  // AQUI A MUDANÇA: Substituímos o <main> por uma <div> simples
  // e removemos o min-h-screen que causava conflito com o layout pai.
  return (
    <div className="bg-[#F8FAFC] w-full">
      <SearchBar />
      <div className="px-3 py-5 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6 w-full">
        <CardFundoAzul />
        <CategoriasPopulares />
        <ProfissionaisRecomendados />
      </div>
    </div>
  );
}
