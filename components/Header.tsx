import { Search, SlidersHorizontal, Bell } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-white p-4 rounded-2xl border">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 bg-gray-100 px-4 py-3 rounded-xl w-[420px]">
          <Search size={18} />

          <input
            type="text"
            placeholder="Buscar serviços..."
            className="bg-transparent outline-none w-full"
          />
        </div>

        <button className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition">
          <SlidersHorizontal size={18} />
          Filtros
        </button>

        <button className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
          Buscar
        </button>
      </div>

      <div className="flex items-center gap-6">
        <Bell size={20} />

        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/100"
            className="w-12 h-12 rounded-full"
            alt="Foto do usuário"
          />

          <div>
            <p className="font-bold">Olá, Pedro</p>
            <span className="text-gray-500 text-sm">Cliente</span>
          </div>
        </div>
      </div>
    </header>
  );
}