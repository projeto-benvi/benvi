import SearchBar from "@/components/searchBar";
import CardFundoAzul from "@/components/CardFundoAzul";
import CategoriasPopulares from "@/components/home/CategoriasPopulares";
import ProfissionaisRecomendados from "@/components/home/profissionaisRecomendados";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* 1. Barra de navegação superior (Fundo branco de ponta a ponta) */}
      <SearchBar />
      
      {/* Container do Conteúdo Interno (Garante o espaçamento correto das laterais) */}
      <div className="p-8 flex flex-col gap-6 w-full">
        {/* 2. O Banner Principal com a Ilustração */}
        <CardFundoAzul />
        
        {/* 3. O Grid de Categorias Populares */}
        <CategoriasPopulares />
        
        {/* 4. A Listagem de Profissionais Recomendados */}
        <ProfissionaisRecomendados />
      </div>
    </main> 
  );
}