"use client";

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Lock, Trash2, Star } from 'lucide-react';

export default function EditarPerfilComponent() {
  // ID do usuário vindo do banco
  const idUsuario = 1;

  // Estados do formulário alinhados com o seu JSON
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  
  // Campos auxiliares para manter a estrutura visual preenchida
  const [dataNascimento, setDataNascimento] = useState('1995-02-18');
  const [estado, setEstado] = useState('PE');
  const [fotoPerfil, setFotoPerfil] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. CARREGAR DADOS DO BANCO (GET)
  useEffect(() => {
    async function carregarDadosDoUsuario() {
      try {
        const resposta = await fetch(`/api/usuario/${idUsuario}`);
        if (resposta.ok) {
          const dados = await resposta.json();
          
          // Mapeamento direto das chaves do seu JSON
          setNome(dados.nome || '');
          setEmail(dados.email || '');
          setTelefone(dados.telefone || '');
          setCidade(dados.cidade || '');
          
          // Tratamentos opcionais caso decida adicionar estes campos no banco depois
          if (dados.data_nascimento) setDataNascimento(dados.data_nascimento.split('T')[0]);
          if (dados.estado) setEstado(dados.estado);
          if (dados.foto_perfil) setFotoPerfil(dados.foto_perfil);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    }

    carregarDadosDoUsuario();
  }, [idUsuario]);

  // 2. SALVANDO OS DADOS DE VOLTA (PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const resposta = await fetch(`/api/usuario/${idUsuario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_usuario: idUsuario,
          nome,
          email,
          telefone,
          cidade,
          estado,
          data_nascimento: dataNascimento,
          foto_perfil: fotoPerfil 
        }),
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        alert('Perfil atualizado com sucesso!');
      } else {
        alert(`Erro ao salvar: ${resultado.erro || 'Falha ao atualizar.'}`);
      }
    } catch (error) {
      console.error("Erro na requisição PUT:", error);
      alert('Erro de rede ao salvar as alterações.');
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFotoPerfil(imageUrl);
    }
  };

  return (
    <div className="w-full text-gray-800 font-sans min-h-screen bg-white">
      <main className="p-4 sm:p-10 pl-6 sm:pl-10 max-w-7xl w-full mx-0 grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-16">
        
        {/* ================= PARTE CENTRAL: FORMULÁRIO ================= */}
        <section className="lg:col-span-3 space-y-6 sm:space-y-8">
          <button type="button" className="flex items-center gap-2.5 text-base text-gray-500 hover:text-gray-700 font-semibold transition-colors">
            <ArrowLeft size={18} /> Voltar
          </button>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Editar Perfil</h1>
            <p className="text-sm sm:text-base text-gray-500">Atualize as suas informações pessoais</p>
          </div>

          <div className="border-b border-gray-200">
            <button type="button" className="border-b-2 border-blue-600 pb-3 px-2 text-base font-bold text-blue-600">
              Dados pessoais
            </button>
          </div>

          {/* Foto de perfil */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800">Foto de perfil</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <input type="file" ref={fileInputRef} onChange={handleFotoChange} accept="image/*" className="hidden" />
              <img src={fotoPerfil} alt="Foto de perfil" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-gray-50" />
              <div className="space-y-1 w-full sm:w-auto">
                <h4 className="font-bold text-gray-900 text-lg">{nome || 'Carregando...'}</h4>
                <p className="text-sm text-gray-400">Cliente ativo</p>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-blue-600 hover:bg-gray-50 transition-colors shadow-sm">
                  <Camera size={16} /> Alterar foto
                </button>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          <form className="space-y-6" onSubmit={handleSubmit}>
            <h3 className="text-base font-bold text-gray-800 mb-3">Informações pessoais</h3>
            
            {/* LINHA 1: Nome completo e Data de nascimento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-600">Nome completo</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-600">Data de nascimento</label>
                <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
              </div>
            </div>

            {/* LINHA 2: Email e Telefone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-600">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-600">Telefone</label>
                <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
              </div>
            </div>

            {/* LINHA 3: Cidade e Estado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-600">Cidade</label>
                <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-600">Estado</label>
                <input type="text" value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
              </div>
            </div>

            {/* Botão de Envio */}
            <div className="flex justify-end pt-4">
              <button type="submit" className="w-full sm:w-auto px-12 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-md transition-colors">
                Concluído
              </button>
            </div>
          </form>
        </section>

        {/* ================= PARTE DIREITA: OUTROS ITENS ================= */}
        <section className="lg:col-span-1 space-y-6 sm:space-y-8">
          
          {/* Card: Prévia do Perfil */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center">
            <h3 className="self-start text-base font-bold text-gray-800 mb-5">Prévia do seu perfil</h3>
            <div className="relative mt-2">
              <img src={fotoPerfil} alt="Avatar Prévia" className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-gray-50" />
            </div>
            <span className="mt-4 bg-emerald-100 text-emerald-700 text-sm font-extrabold px-5 py-1.5 rounded-full">
              Cliente
            </span>
            <div className="grid grid-cols-2 w-full mt-6 border-t border-gray-100 pt-5 text-center divide-x divide-gray-100">
              <div>
                <div className="flex items-center justify-center gap-1 text-base font-black text-gray-900">
                  <Star size={18} className="text-amber-400 fill-amber-400" /> 4,8
                </div>
                <p className="text-xs font-medium text-gray-400 mt-1">Média de avaliações</p>
              </div>
              <div>
                <div className="text-base font-black text-gray-900">10</div>
                <p className="text-xs font-medium text-gray-400 mt-1">Serviços contratados</p>
              </div>
            </div>
          </div>

          {/* Card: Ações da Conta */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-5">Ações da conta</h3>
            <div className="space-y-2">
              <button type="button" className="w-full flex items-center gap-3.5 px-3 py-3.5 text-base text-gray-700 font-semibold hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50">
                <span className="text-xl">🛠️</span> Prestar serviço
              </button>
              <button type="button" className="w-full flex items-center gap-3.5 px-3 py-3.5 text-base text-gray-700 font-semibold hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50">
                <Lock size={20} className="text-blue-500" /> Alterar senha
              </button>
              <button type="button" className="w-full flex items-center gap-3.5 px-3 py-3.5 text-base text-red-600 font-semibold hover:bg-red-50 rounded-xl transition-colors">
                <Trash2 size={20} className="text-red-500" /> Excluir conta
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}