'use client';

import React, { useState, useEffect } from "react";
import SearchBar from "@/components/searchBar";

interface PerfilUsuario {
  nome: string;
  dataNascimento: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  sobre: string;
}

export default function TelaConfiguracoes() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<PerfilUsuario>({
    nome: '',
    dataNascimento: '',
    email: '',
    telefone: '',
    cidade: '',
    estado: '',
    sobre: ''
  });

  // READ: Busca os dados ao carregar a tela
  useEffect(() => {
    setIsMounted(true);
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/perfil');
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // UPDATE: Envia as alterações para o backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (response.ok) alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    }
  };

  if (!isMounted) return null;
  if (loading) return <div className="p-10">Carregando informações...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col gap-6">
      <SearchBar />

      <div className="max-w-5xl w-full mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurações</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
          {/* Menu Lateral */}
          <div className="col-span-3 space-y-2">
            <button type="button" className="w-full flex items-center gap-3 px-4 py-3 bg-[#EBF3FF] text-[#2563EB] rounded-xl font-medium text-sm text-left">
              <span>👤</span> Editar perfil
            </button>
            <button type="button" className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white text-gray-600 rounded-xl text-sm text-left">
              <span>🔒</span> Conta e segurança
            </button>
          </div>

          {/* Área de Edição */}
          <div className="col-span-9 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            
            {/* Header da Foto */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border border-gray-100">
                <img 
                  src="/caminho-da-sua-foto.png" 
                  alt="Carlos Silva" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="font-bold text-lg">Carlos Silva</h2>
                <p className="text-xs text-gray-400">Prestador desde Jan 2026</p>
                <button type="button" className="text-blue-600 text-sm font-medium">Alterar foto</button>
              </div>
            </div>

            {/* Inputs em Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                <input type="text" value={profile.nome} onChange={(e) => setProfile({...profile, nome: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento</label>
                <input type="text" value={profile.dataNascimento} onChange={(e) => setProfile({...profile, dataNascimento: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input type="text" value={profile.telefone} onChange={(e) => setProfile({...profile, telefone: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500" />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sobre você</label>
                <textarea rows={4} value={profile.sobre} onChange={(e) => setProfile({...profile, sobre: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                Salvar alterações
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}