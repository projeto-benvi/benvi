import CardFundoAzul from "../components/CardFundoAzul";
import ProfissionaisRecomendados from "@/components/home/profissionaisRecomendados";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-8">
      <CardFundoAzul />
      <ProfissionaisRecomendados />
  );
}