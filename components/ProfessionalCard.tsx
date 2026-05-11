import { Star } from "lucide-react";

export default function ProfessionalCard() {
  return (
    <div className="bg-white border rounded-2xl p-5">

      <div className="flex items-center gap-3">

        <img
          src="https://i.pravatar.cc/100"
          className="w-16 h-16 rounded-full"
        />

        <div>
          <h3 className="font-bold">
            Carlos Silva
          </h3>

          <p className="text-gray-500 text-sm">
            Eletricista
          </p>

          <div className="flex items-center gap-1 text-yellow-500 mt-1">
            <Star size={14} fill="currentColor" />
            <span className="text-sm">
              4.9
            </span>
          </div>
        </div>

      </div>

      <button className="w-full bg-blue-600 text-white py-3 rounded-xl mt-5 hover:bg-blue-700 transition">
        Ver perfil
      </button>

    </div>
  );
}