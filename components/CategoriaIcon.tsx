import {
  Baby,
  Bike,
  BookOpen,
  Brush,
  CakeSlice,
  Camera,
  Car,
  ChefHat,
  Construction,
  Dumbbell,
  Droplet,
  Hammer,
  HeartHandshake,
  KeyRound,
  Laptop,
  Paintbrush,
  Scissors,
  Shirt,
  Sparkles,
  Sprout,
  Truck,
  Video,
  Wand2,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

type CategoriaIconProps = {
  nome: string;
  className?: string;
};

function normalizar(nome: string) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escolherIcone(nome: string): { Icon: LucideIcon; color: string } {
  const n = normalizar(nome);

  if (n.includes("eletricista")) return { Icon: Zap, color: "text-blue-600" };
  if (n.includes("encanador")) return { Icon: Droplet, color: "text-cyan-600" };
  if (n.includes("pedreiro")) return { Icon: Hammer, color: "text-green-600" };
  if (n.includes("pintor") || n.includes("pintura")) return { Icon: Paintbrush, color: "text-purple-600" };
  if (n.includes("diarista") || n.includes("faxineira")) return { Icon: Sparkles, color: "text-sky-600" };
  if (n.includes("jardineiro")) return { Icon: Sprout, color: "text-emerald-600" };
  if (n.includes("marceneiro") || n.includes("carpinteiro") || n.includes("montador")) return { Icon: Construction, color: "text-amber-700" };
  if (n.includes("serralheiro")) return { Icon: Wrench, color: "text-slate-600" };
  if (n.includes("ar-condicionado")) return { Icon: Wand2, color: "text-cyan-700" };
  if (n.includes("informatica") || n.includes("social media") || n.includes("designer")) return { Icon: Laptop, color: "text-indigo-600" };
  if (n.includes("chaveiro")) return { Icon: KeyRound, color: "text-blue-600" };
  if (n.includes("gesseiro")) return { Icon: Brush, color: "text-orange-500" };
  if (n.includes("camera")) return { Icon: Video, color: "text-slate-700" };
  if (n.includes("manicure") || n.includes("cabeleireiro") || n.includes("maquiador")) return { Icon: Scissors, color: "text-pink-600" };
  if (n.includes("fotografo")) return { Icon: Camera, color: "text-fuchsia-600" };
  if (n.includes("personal")) return { Icon: Dumbbell, color: "text-red-500" };
  if (n.includes("professor")) return { Icon: BookOpen, color: "text-blue-700" };
  if (n.includes("cuidador")) return { Icon: HeartHandshake, color: "text-rose-500" };
  if (n.includes("baba")) return { Icon: Baby, color: "text-violet-600" };
  if (n.includes("lavador") || n.includes("automotiva")) return { Icon: Car, color: "text-blue-600" };
  if (n.includes("motoboy") || n.includes("entregador")) return { Icon: Bike, color: "text-green-600" };
  if (n.includes("costureira") || n.includes("roupas")) return { Icon: Shirt, color: "text-teal-600" };
  if (n.includes("confeiteira") || n.includes("bolo") || n.includes("doces")) return { Icon: CakeSlice, color: "text-pink-600" };
  if (n.includes("decorador") || n.includes("eventos")) return { Icon: ChefHat, color: "text-amber-600" };
  if (n.includes("frete") || n.includes("mudanca")) return { Icon: Truck, color: "text-slate-600" };

  return { Icon: Wrench, color: "text-blue-600" };
}

export function CategoriaIcon({ nome, className = "w-7 h-7" }: CategoriaIconProps) {
  const { Icon, color } = escolherIcone(nome);
  return <Icon className={className + " " + color} />;
}
