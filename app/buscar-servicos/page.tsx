import { Suspense } from "react";
import BuscarServicosView from "@/view/buscarServicos";

export default function BuscarServicosPage() {
  return (
    <Suspense fallback={null}>
      <BuscarServicosView />
    </Suspense>
  );
}
