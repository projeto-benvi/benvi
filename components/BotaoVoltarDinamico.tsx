'use client';

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BotaoVoltarDinamico() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition mb-4"
    >
      <ArrowLeft size={16} />
      Voltar
    </button>
  );
}