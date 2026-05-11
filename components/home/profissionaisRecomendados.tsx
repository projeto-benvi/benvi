'use client';

import Image from "next/image";

type Profissional = {
    id: number;
    nome: string;
    profissao: string;
    avaliacao: number;
    avaliacoes: number;
    localizacao: string;
    foto: string;
}

const profissionais: Profissional[] = [
    {
    id: 1,
    nome: "Carlos Silva",
    profissao: "Encanador",
    avaliacao: 4.5,
    avaliacoes: 150,
    localizacao: "Garanhuns-PE",
    foto: "/profissionais/carlos.png",
  },
  {
    id: 2,
    nome: "Jodivaldo",
    profissao: "Eletricista",
    avaliacao: 4.8,
    avaliacoes: 98,
    localizacao: "Garanhuns-PE",
    foto: "/profissionais/jodivaldo.png",
  },
  {
    id: 3,
    nome: "Arthur",
    profissao: "Pintor",
    avaliacao: 3.9,
    avaliacoes: 58,
    localizacao: "Garanhuns-PE",
    foto: "/profissionais/arthur.png",
  },
  {
    id: 4,
    nome: "Jose Antônio",
    profissao: "Marceneiro",
    avaliacao: 4.9,
    avaliacoes: 132,
    localizacao: "Garanhuns-PE",
    foto: "/profissionais/jose.png",
  },
  {
    id: 5,
    nome: "Carlos",
    profissao: "Pedreiro",
    avaliacao: 4.5,
    avaliacoes: 92,
    localizacao: "Garanhuns-PE",
    foto: "/profissionais/carlos2.png",
  },
]

export default function ProfissionaisRecomendados() {
    return (
        <section className="w-full mt-10">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Profissionais Recomendados
                </h2>

                <button className="text-sm text-blue-600 hover:underline">
                    Ver todos
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {profissionais.map((profissional) => (
                    <div 
                     key={profissional.id}
                     className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col items-center">
                        <div className="mb-3">
                            <Image
                                src={profissional.foto}
                                alt={profissional.nome}
                                width={64}
                                height={64}
                                className="rounded-full object-cover"
                            />
                        </div>

                        <h3 className="font-semibold text-gray-800 text-center">
                            {profissional.nome}
                        </h3>

                        <p className="text-sm text-gray-600">
                            {profissional.profissao}
                        </p>

                        <div className="flex items-center gap-1 text-sm mb-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-medium">{profissional.avaliacao}</span>
                            <span className="text-gray-400">({profissional.avaliacoes})</span>
                        </div>

                        <p className="text-xs text-gray-400 mb-4">
                            {profissional.localizacao}
                        </p>

                        <button className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium py-2 rounded-x1">
                            Ver Perfil
                        </button>

                    </div>
                ))}
            </div>
        </section>
    );
}