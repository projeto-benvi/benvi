import Image from "next/image";
import logoBenvi from "@/assets/logoBenvi.png";

import {
  Home,
  Search,
  MessageCircle,
  Heart,
  Star,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    label: "Início",
    icon: Home,
    active: true,
  },
  {
    label: "Buscar serviços",
    icon: Search,
    active: false,
  },
  {
    label: "Mensagens",
    icon: MessageCircle,
    active: false,
  },
  {
    label: "Favoritos",
    icon: Heart,
    active: false,
  },
  {
    label: "Avaliações",
    icon: Star,
    active: false,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-250px min-h-screen bg-white border-r border-gray-200 px-5 py-6 flex flex-col justify-between">
      <div>
        <div className="mb-10">
          <Image
            src={logoBenvi}
          alt="Logo Benvi"
          width={135}
          height={45}
          priority
            />
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  item.active
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
          <Settings size={18} />
          Configurações
        </button>

        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}