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
  Loader2,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor
} from "lucide-react";

export default function ConfiguracoesView() {
  const { user, logado, atualizarSessao } = useAuth();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [verSenhaAtual, setVerSenhaAtual] = useState(false);
  const [verNovaSenha, setVerNovaSenha] = useState(false);
  const [verConfirmaSenha, setVerConfirmaSenha] = useState(false);

  const [abaAtiva, setAbaAtiva] = useState("perfil");
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroMensagem, setErroMensagem] = useState("");
  
  // Estados do Perfil
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [sobreVoce, setSobreVoce] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  
  const [avatarUrl, setAvatarUrl] = useState(""); 
  const [arquivoFoto, setArquivoFoto] = useState<File | null>(null);

  // Estados das Notificações
  const [notifEmailPedidos, setNotifEmailPedidos] = useState(true);
  const [notifEmailMensagens, setNotifEmailMensagens] = useState(true);
  const [notifEmailNovidades, setNotifEmailNovidades] = useState(false);
  const [notifPushMensagens, setNotifPushMensagens] = useState(true);
  const [notifPushStatus, setNotifPushStatus] = useState(true);

  // Estados de Privacidade
  const [perfilPublico, setPerfilPublico] = useState(true);
  const [mostrarTelefone, setMostrarTelefone] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(true);
  const [permitirDicasAI, setPermitirDicasAI] = useState(true);

  // Estados de Preferências
  const [tema, setTema] = useState("sistema"); // claro, escuro, sistema
  const [idioma, setIdioma] = useState("pt-BR");
  const [moeda, setMoeda] = useState("BRL");
  const [resumoAtividades, setResumoAtividades] = useState("semanal"); // diario, semanal, mensal, nenhum

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
      if (dados.avatar) setAvatarUrl(dados.avatar);
      await atualizarSessao();
      setArquivoFoto(null);
      setSucesso(true);
    } catch (error: any) {
      setErroMensagem(error.message || "Erro inesperado ao salvar");
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvarNotificacoes = async () => {
    setCarregando(true);
    setSucesso(false);
    setErroMensagem("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSucesso(true);
    } catch (error) {
      setErroMensagem("Erro ao salvar preferências de alertas.");
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvarPrivacidade = async () => {
    setCarregando(true);
    setSucesso(false);
    setErroMensagem("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSucesso(true);
    } catch (error) {
      setErroMensagem("Erro ao salvar opções de privacidade.");
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvarPreferencias = async () => {
    setCarregando(true);
    setSucesso(false);
    setErroMensagem("");

    try {
      // Simulação de persistência das preferências locais/tema
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSucesso(true);
    } catch (error) {
      setErroMensagem("Erro ao salvar preferências visuais.");
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

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <input type="file" ref={fileInputRef} onChange={handleTrocarFoto} accept="image/*" className="hidden" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie suas preferências e configurações da conta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
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
              onClick={() => {
                setAbaAtiva(id);
                setSucesso(false);
                setErroMensagem("");
              }}
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

        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          {/* ABA EDITAR PERFIL */}
          {abaAtiva === "perfil" && (
            <form onSubmit={handleSalvarAlteracoes} className="space-y-6">
              <div className="flex items-center gap-5 pb-4 border-b border-gray-50">
                <div onClick={acionarInputArquivo} className="relative group w-20 h-20 cursor-pointer">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover border border-gray-200 shadow-sm" />
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
                  <button type="button" onClick={acionarInputArquivo} className="mt-2 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                    Alterar foto
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Nome completo</label>
                  <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Data de nascimento</label>
                  <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Email</label>
                  <input type="email" value={email} disabled className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Telefone</label>
                  <input type="text" value={telefone} placeholder="(00) 00000-0000" onChange={(e) => setTelefone(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div>
                  {sucesso && <span className="text-xs text-green-600 font-bold">✓ Alterações salvas com sucesso!</span>}
                  {erroMensagem && <span className="text-xs text-red-500 font-bold">✗ {erroMensagem}</span>}
                </div>
                <button type="submit" disabled={carregando} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2">
                  {carregando && <Loader2 size={16} className="animate-spin" />}
                  Salvar alterações
                </button>
              </div>
            </form>
          )}

          {/* ABA CONTA E SEGURANÇA */}
          {abaAtiva === "seguranca" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Conta e Segurança</h2>
                <p className="text-sm text-gray-500">Gerencie sua senha e opções de acesso.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Senha atual</label>
                  <div className="relative">
                    <input type={verSenhaAtual ? "text" : "password"} placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition pr-10" />
                    <button type="button" onClick={() => setVerSenhaAtual(!verSenhaAtual)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {verSenhaAtual ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Nova senha</label>
                    <div className="relative">
                      <input type={verNovaSenha ? "text" : "password"} placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition pr-10" />
                      <button type="button" onClick={() => setVerNovaSenha(!verNovaSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {verNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Confirmar nova senha</label>
                    <div className="relative">
                      <input type={verConfirmaSenha ? "text" : "password"} placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition pr-10" />
                      <button type="button" onClick={() => setVerConfirmaSenha(!verConfirmaSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {verConfirmaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex justify-end">
                <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition cursor-pointer">
                  Atualizar senha
                </button>
              </div>
            </div>
          )}

          {/* ABA NOTIFICAÇÕES */}
          {abaAtiva === "notificacoes" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Preferências de Notificações</h2>
                <p className="text-sm text-gray-500">Escolha como e quando deseja ser alertado pelo Benvi.</p>
              </div>

              <div className="divide-y divide-gray-100">
                <div className="py-4 space-y-4">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Alertas por E-mail</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Atualizações de pedidos</p>
                      <p className="text-xs text-gray-400">Receba avisos sobre novos orçamentos, aprovações e finalizações.</p>
                    </div>
                    <button type="button" onClick={() => setNotifEmailPedidos(!notifEmailPedidos)} className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${notifEmailPedidos ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${notifEmailPedidos ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Novas mensagens</p>
                      <p className="text-xs text-gray-400">Avisar por e-mail quando um cliente ou prestador enviar uma mensagem no chat.</p>
                    </div>
                    <button type="button" onClick={() => setNotifEmailMensagens(!notifEmailMensagens)} className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${notifEmailMensagens ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${notifEmailMensagens ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div>{sucesso && <span className="text-xs text-green-600 font-bold">✓ Preferências salvas!</span>}</div>
                <button type="button" onClick={handleSalvarNotificacoes} className="bg-blue-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl">
                  Salvar preferências
                </button>
              </div>
            </div>
          )}

          {/* ABA PRIVACIDADE */}
          {abaAtiva === "privacidade" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Configurações de Privacidade</h2>
                <p className="text-sm text-gray-500">Controle quem tem acesso aos seus dados e histórico no Benvi.</p>
              </div>

              <div className="divide-y divide-gray-100">
                <div className="py-4 space-y-4">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Visibilidade do perfil</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Perfil indexável (Público)</p>
                      <p className="text-xs text-gray-400">Permitir que seu perfil e portfólio apareçam no Google e buscas internas.</p>
                    </div>
                    <button type="button" onClick={() => setPerfilPublico(!perfilPublico)} className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${perfilPublico ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${perfilPublico ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div>{sucesso && <span className="text-xs text-green-600 font-bold">✓ Opções de privacidade salvas!</span>}</div>
                <button type="button" onClick={handleSalvarPrivacidade} className="bg-blue-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl">
                  Salvar configurações
                </button>
              </div>
            </div>
          )}

          {/* ABA PREFERÊNCIAS */}
          {abaAtiva === "preferencias" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Preferências do Sistema</h2>
                <p className="text-sm text-gray-500">Personalize sua experiência visual e regional dentro da plataforma.</p>
              </div>

              <div className="space-y-5">
                {/* Seleção de Tema */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700">Aparência do Aplicativo</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "claro", label: "Claro", icon: Sun },
                      { id: "escuro", label: "Escuro", icon: Moon },
                      { id: "sistema", label: "Sistema", icon: Monitor },
                    ].map((item) => {
                      const Icone = item.icon;
                      const ativo = tema === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTema(item.id)}
                          className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-xl text-xs font-bold transition cursor-pointer ${
                            ativo
                              ? "border-blue-600 bg-blue-50/50 text-blue-600"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <Icone size={16} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Idioma e Região */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Idioma padrão</label>
                    <select
                      value={idioma}
                      onChange={(e) => setIdioma(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en">English (US)</option>
                      <option value="es">Español</option>
                    </select>
                  </div>

      
                </div>

                {/* Relatórios e Dados */}
                <div className="flex flex-col gap-1.5 pt-2">
                  <label className="text-xs font-bold text-gray-700">Resumo de Atividades por E-mail</label>
                  <p className="text-[11px] text-gray-400 mb-1">Com que frequência deseja receber o consolidado de visitas ao perfil e orçamentos?</p>
                  <select
                    value={resumoAtividades}
                    onChange={(e) => setResumoAtividades(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="diario">Todos os dias pela manhã</option>
                    <option value="semanal">Semanalmente (Toda segunda-feira)</option>
                    <option value="mensal">Mensalmente (Primeiro dia do mês)</option>
                    <option value="nenhum">Não enviar resumos consolidados</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div>
                  {sucesso && <span className="text-xs text-green-600 font-bold">✓ Preferências salvas com sucesso!</span>}
                  {erroMensagem && <span className="text-xs text-red-500 font-bold">✗ {erroMensagem}</span>}
                </div>
                <button
                  type="button"
                  onClick={handleSalvarPreferencias}
                  disabled={carregando}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2"
                >
                  {carregando && <Loader2 size={16} className="animate-spin" />}
                  Salvar preferências
                </button>
              </div>
            </div>
          )}

          {/* CASO ALGO ADICIONAL SEJA SELECIONADO */}
          {abaAtiva === "suporte" && (
            <div className="text-center py-12 text-gray-400 text-sm">
              Esta seção de <strong className="capitalize">{abaAtiva}</strong> está integrada e aguardando as regras do banco de dados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}