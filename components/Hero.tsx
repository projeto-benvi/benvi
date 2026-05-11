import Image from "next/image";
import heroImage from "@/assets/heroPersonagem.png";

export default function Hero() {
return (
    <section className="mt-8 bg-linear-to-r from-blue-500 to-green-400 rounded-3xl p-10 flex items-center justify-between">

      <div className="max-w-500px text-white">

        <h2 className="text-5xl font-bold leading-tight">
          Encontre o profissional ideal
          para o que você precisa
        </h2>

        <p className="mt-5 text-lg">
          Conectamos você com profissionais confiáveis e avaliados pela comunidade.
        </p>

        <div className="bg-white p-3 rounded-2xl mt-8 flex items-center gap-3">

          <input
            type="text"
            placeholder="O que você precisa?"
            className="flex-1 outline-none text-black"
          />

          <button className="bg-blue-600 text-white px-8 py-3 rounded-xl">
            Buscar
          </button>
        </div>

      </div>

      <Image
        src={heroImage}
        className="w-300px"
        alt="Hero Image"
      />

    </section>
  );
}