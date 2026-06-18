"use client";

import { useParams } from 'next/navigation';
import EditarUsuarioComponent from "@/view/editarUsuario"; 

export default function RotaDinamicaPage() {
  const params = useParams();
  
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id; 

  return <EditarUsuarioComponent idUsuario={id} />;
}