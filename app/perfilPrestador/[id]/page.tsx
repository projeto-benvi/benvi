// app/perfilPrestador/[id]/page.tsx

import PerfilPrestadorView from "@/view/perfilPrestador";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function PerfilPrestadorPage({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <main className="w-full">
      <PerfilPrestadorView id={id} />
    </main>
  );
}