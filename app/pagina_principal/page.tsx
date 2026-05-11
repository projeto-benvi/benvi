import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import ProfessionalCard from "@/components/ProfessionalCard";
import domesticos from "@/assets/domesticos.png";
import unhas_beleza from "@/assets/unhas_beleza.png";
import eletricos from "@/assets/eletricos.png";
import pintura from "@/assets/pintura.png";
import frete from "@/assets/frete.png";

export default function Home() {
  return (
    <main className="flex min-h-screen bg-[#f5f5f5]">
      
      <Sidebar />

      <section className="flex-1 p-6">

        <Header />

        <Hero />

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Categorias populares
            </h2>

            <button className="text-blue-600">
              Ver todos
            </button>
          </div>

          <div className="grid grid-cols-5 gap-4 mt-6">
            <CategoryCard title="Limpeza e faxina" icon={domesticos} />
            <CategoryCard title="Unhas e Beleza" icon={unhas_beleza} />
            <CategoryCard title="Manutenção elétrica" icon={eletricos} />
            <CategoryCard title="Pintura e reformas" icon={pintura} />
            <CategoryCard title="Frete e mudança" icon={frete} />
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Profissionais recomendados
            </h2>

            <button className="text-blue-600">
              Ver todos
            </button>
          </div>

          <div className="grid grid-cols-5 gap-5 mt-6">
            <ProfessionalCard />
            <ProfessionalCard />
            <ProfessionalCard />
            <ProfessionalCard />
            <ProfessionalCard />
          </div>
        </div>

      </section>
    </main>
  );
}