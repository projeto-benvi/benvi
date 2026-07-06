import { Suspense } from "react";
import ConfiguracoesView from "@/view/viewConfiguracoes";


export const dynamic = "force-dynamic";

export default function ConfiguracoesPage() {
  return (
    <Suspense fallback={null}>
      <ConfiguracoesView />
    </Suspense>
  );
}
