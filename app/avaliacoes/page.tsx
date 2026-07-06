import { Suspense } from "react";
import Avaliacoes from "@/view/avaliacoes";



export default function viewAvaliacoes(){
    return(
        <main className="min-h-screen">
            <Suspense fallback={null}>
                <Avaliacoes />
            </Suspense>

        </main>
    )
}
