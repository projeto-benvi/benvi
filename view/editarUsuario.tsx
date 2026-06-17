"use client";

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Trash2, Star, X, AlertTriangle } from 'lucide-react';

export default function EditarPerfilComponent() {

  //ATENÇÃO: O usuário está fixado como 1, para testes. Modificar para o usuário que efetuou o login.
  const idUsuario = 1;

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [data_nascimento, setDataNascimento] = useState('');
  const [foto_perfil, setFotoPerfil] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');
  const [estado, setEstado] = useState('PE');

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [senhaConfirmacaoExcluir, setSenhaConfirmacaoExcluir] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function carregarDadosDoUsuario() {
      try {
        const resposta = await fetch(`/api/usuario/${idUsuario}`);
        if (resposta.ok) {
          const dados = await resposta.json();
          setNome(dados.nome || '');
          setEmail(dados.email || '');
          setTelefone(dados.telefone || '');
          setCidade(dados.cidade || '');
          if (dados.data_nascimento) setDataNascimento(dados.data_nascimento.split('T')[0]);
          if (dados.foto_perfil) setFotoPerfil(dados.foto_perfil);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    }
    carregarDadosDoUsuario();
  }, [idUsuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dadosParaAtualizar: Record<string, any> = { nome, email, telefone, cidade };
      if (data_nascimento) dadosParaAtualizar.data_nascimento = data_nascimento;
      
      const resposta = await fetch(`/api/usuario/${idUsuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaAtualizar),
      });

      if (resposta.ok) {
        alert('Perfil atualizado com sucesso!');
      } else {
        const erroDados = await resposta.json();
        alert(`Erro no servidor: ${erroDados.erro || 'Falha ao atualizar.'}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleExcluirConta = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senhaConfirmacaoExcluir) {
      alert('Por favor, digite sua senha para confirmar.');
      return;
    }

    try {
      const resposta = await fetch(`/api/usuario/${idUsuario}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: senhaConfirmacaoExcluir }),
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        alert('Sua conta foi excluída permanentemente.');
        setModalExcluirAberto(false);
        setSenhaConfirmacaoExcluir('');
      } else {
        alert(`Erro ao excluir: ${resultado.erro || 'Não foi possível concluir a ação.'}`);
      }
    } catch (error) {
      console.error("Erro na requisição DELETE:", error);
      alert('Erro de rede ao tentar excluir a conta.');
    }
  };

  return (
    <div className="w-full text-gray-800 font-sans min-h-screen bg-white relative">
      <main className="p-4 sm:p-10 pl-6 sm:pl-10 max-w-7xl w-full mx-0 grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-16">
        
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

          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800">Foto de perfil</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <input type="file" ref={fileInputRef} accept="image/*" className="hidden" />
              <img src={foto_perfil} alt="Foto de perfil" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-gray-50" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-600">Nome completo</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-600">Data de nascimento</label>
                <input type="date" value={data_nascimento} onChange={(e) => setDataNascimento(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
              </div>
            </div>

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

            <div className="flex justify-end pt-4">
              <button type="submit" className="w-full sm:w-auto px-12 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-md transition-colors">
                Concluído
              </button>
            </div>
          </form>
        </section>

        <section className="lg:col-span-1 space-y-6 sm:space-y-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center">
            <h3 className="self-start text-base font-bold text-gray-800 mb-5">Prévia do seu perfil</h3>
            <div className="relative mt-2">
              <img src={foto_perfil} alt="Avatar" className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-gray-50" />
            </div>
            <span className="mt-4 bg-emerald-100 text-emerald-700 text-sm font-extrabold px-5 py-1.5 rounded-full">Cliente</span>
            <div className="grid grid-cols-2 w-full mt-6 border-t border-gray-100 pt-5 text-center divide-x divide-gray-100">
              <div>
                <div className="flex items-center justify-center gap-1 text-base font-black text-gray-900"><Star size={18} className="text-amber-400 fill-amber-400" /> 4,8</div>
                <p className="text-xs font-medium text-gray-400 mt-1">Média de avaliações</p>
              </div>
              <div>
                <div className="text-base font-black text-gray-900">10</div>
                <p className="text-xs font-medium text-gray-400 mt-1">Serviços contratados</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-5">Ações da conta</h3>
            <div className="space-y-2">
              <button type="button" className="w-full flex items-center gap-3.5 px-3 py-3.5 text-base text-gray-700 font-semibold hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50">
                <span className="text-xl">🛠️</span> Prestar serviço
              </button>
              
              <button type="button" onClick={() => setModalExcluirAberto(true)} className="w-full flex items-center gap-3.5 px-3 py-3.5 text-base text-red-600 font-semibold hover:bg-red-50 rounded-xl transition-colors">
                <Trash2 size={20} className="text-red-500" /> Excluir conta
              </button>
            </div>
          </div>
        </section>
      </main>

      {modalExcluirAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-red-50 bg-red-50/50">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle size={22} className="animate-pulse" />
                <h3 className="text-lg font-black tracking-tight">Excluir Conta Permanentemente</h3>
              </div>
              <button type="button" onClick={() => setModalExcluirAberto(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleExcluirConta} className="p-6 space-y-4">
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Atenção: Esta ação é **irreversível**. Todos os seus dados, serviços contratados e históricos serão removidos para sempre da nossa plataforma.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs font-bold text-amber-800 leading-normal">
                ⚠️ Para confirmar a exclusão, digite a sua senha atual no campo abaixo.
              </div>
              <div className="space-y-1.5 pt-2">
                <label className="block text-sm font-bold text-gray-700">Sua senha atual</label>
                <input type="password" required placeholder="Digite sua senha aqui" value={senhaConfirmacaoExcluir} onChange={(e) => setSenhaConfirmacaoExcluir(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-base bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none transition-all" />
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setModalExcluirAberto(false)} className="w-full py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 text-center">Voltar e Salvar Conta</button>
                <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all text-center">Excluir de Vez</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}