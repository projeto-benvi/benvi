"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Sliders, 
  LifeBuoy, 
  Camera, 
  Loader2 
} from "lucide-react";

export default function ConfiguracoesView() {
  const { user, logado, atualizarSessao } = useAuth();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [abaAtiva, setAbaAtiva] = useState("perfil");
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroMensagem, setErroMensagem] = useState("");
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [sobreVoce, setSobreVoce] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  
  const [avatarUrl, setAvatarUrl] = useState(""); 
  const [arquivoFoto, setArquivoFoto] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setNome(user.nome || "");
      setEmail(user.email || "");
      setAvatarUrl(user.avatar || "");
      setTelefone((user as any).telefone || "");
      setCidade((user as any).cidade || "");
      setEstado((user as any).estado || "");
      setSobreVoce((user as any).sobreVoce || "");
      setDataNascimento((user as any).dataNascimento || "");
    }
  }, [user]);

  const handleTrocarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (arquivo) {
      setArquivoFoto(arquivo);
      setAvatarUrl(URL.createObjectURL(arquivo));
    }
  };

  const acionarInputArquivo = () => {
    fileInputRef.current?.click();
  };

  const handleSalvarAlteracoes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setCarregando(true);
    setSucesso(false);
    setErroMensagem("");

    try {
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("telefone", telefone);
      formData.append("cidade", cidade);
      formData.append("estado", estado);
      formData.append("sobreVoce", sobreVoce);
      formData.append("dataNascimento", dataNascimento);

      if (arquivoFoto) {
        formData.append("avatar", arquivoFoto);
      }

      const res = await fetch(`/api/usuario/${user.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.erro || "Erro ao salvar alterações");
      }

      const dados = await res.json();

      if (dados.avatar) {
        setAvatarUrl(dados.avatar);
      }

      // Atualiza a sessão para persistir após reload
      await atualizarSessao();

      setArquivoFoto(null);
      setSucesso(true);
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error);
      setErroMensagem(error.message || "Erro inesperado ao salvar");
    } finally {
      setCarregando(false);
    }
  };

  if (!logado) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-500">
        Por favor, faça login para acessar as configurações da sua conta.
      </div>
    );
  }

  const isPrestador = user?.isPrestador;
  const isAdmin = user?.isAdmin;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleTrocarFoto}
        accept="image/*"
        className="hidden" 
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie suas preferências e configurações da conta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Menu lateral */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
          {[
            { id: "perfil", icon: User, label: "Editar perfil", sub: "Suas informações pessoais" },
            { id: "seguranca", icon: Lock, label: "Conta e segurança", sub: "Senha, login e privacidade" },
            { id: "notificacoes", icon: Bell, label: "Notificações", sub: "Preferências de alertas" },
            { id: "privacidade", icon: Shield, label: "Privacidade", sub: "Quem pode ver seu perfil" },
            { id: "preferencias", icon: Sliders, label: "Preferências", sub: "Idioma, tema e outros" },
            { id: "suporte", icon: LifeBuoy, label: "Suporte", sub: "Central de ajuda e contato" },
          ].map(({ id, icon: Icon, label, sub }) => (
            <button
              key={id}
              type="button"
              onClick={() => setAbaAtiva(id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-semibold transition text-left ${
                abaAtiva === id ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              <div>
                <p className="font-bold">{label}</p>
                <p className="text-[10px] text-gray-400 font-normal mt-0.5">{sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Conteúdo principal */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          {abaAtiva === "perfil" && (
            <form onSubmit={handleSalvarAlteracoes} className="space-y-6">
              
              {/* Foto de perfil */}
              <div className="flex items-center gap-5 pb-4 border-b border-gray-50">
                <div 
                  onClick={acionarInputArquivo}
                  className="relative group w-20 h-20 cursor-pointer"
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover border border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                      {user?.nome?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                    <Camera size={18} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800">{nome || "Carregando..."}</h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    {isAdmin ? "Administrador do Sistema" : isPrestador ? "Prestador de Serviços" : "Cliente Benvi"}
                  </p>
                  <button 
                    type="button" 
                    onClick={acionarInputArquivo}
                    className="mt-2 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    Alterar foto
                  </button>
                </div>
              </div>

              {/* Campos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Nome completo</label>
                  <input 
                    type="text" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Data de nascimento</label>
                  <input 
                    type="date" 
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    disabled 
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Telefone</label>
                  <input 
                    type="text" 
                    value={telefone}
                    placeholder="(00) 00000-0000"
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Cidade</label>
                  <input 
                    type="text" 
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Estado</label>
                  <input 
                    type="text" 
                    value={estado}
                    maxLength={2}
                    placeholder="EX: PE"
                    onChange={(e) => setEstado(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition uppercase"
                  />
                </div>
              </div>

              {(isPrestador || isAdmin) && (
                <div className="flex flex-col gap-1.5 pt-2">
                  <label className="text-xs font-bold text-gray-700">Sobre você</label>
                  <textarea 
                    rows={4}
                    value={sobreVoce}
                    onChange={(e) => setSobreVoce(e.target.value)}
                    placeholder="Conte sobre sua experiência profissional para atrair mais clientes..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition resize-none"
                  />
                </div>
              )}

              {/* Rodapé */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div>
                  {sucesso && (
                    <span className="text-xs text-green-600 font-bold">✓ Alterações salvas com sucesso!</span>
                  )}
                  {erroMensagem && (
                    <span className="text-xs text-red-500 font-bold">✗ {erroMensagem}</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={carregando}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 disabled:opacity-70"
                >
                  {carregando && <Loader2 size={16} className="animate-spin" />}
                  Salvar alterações
                </button>
              </div>
            </form>
          )}

          {abaAtiva !== "perfil" && (
            <div className="text-center py-12 text-gray-400 text-sm">
              Esta seção de <strong className="capitalize">{abaAtiva}</strong> está integrada e aguardando as regras do banco de dados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}