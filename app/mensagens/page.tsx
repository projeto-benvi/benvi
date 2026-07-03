import { Suspense } from "react";
import Conversa from "@/view/conversa";

export default function viewconversacliente(){
    return(
            <main className="min-h-screen">
                <Suspense fallback={null}>
                    <Conversa />
                </Suspense>
    
            </main>
        )
}
