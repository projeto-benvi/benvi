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
  Monitor,
  Headphones,
  Bug,
  FileText,
  MessageSquare,
  Mail,
  Phone,
  Upload,
  Briefcase
} from "lucide-react";

type CategoriaBanco = {
  id_categoria: number;
  nome_categoria: string;
  descricao?: string;
};

type CategoriaVinculada = {
  id_categoria: number;
  nome_categoria: string;
};

export default function ConfiguracoesView() {
  const { user, logado, atualizarSessao } = useAuth();

  useEffect(() => {
    console.log('user:', user);
  }, [user]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadSuporteRef = useRef<HTMLInputElement>(null);
  
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

  // Estados Profissionais
  const [descricaoProfissional, setDescricaoProfissional] = useState("");
  const [categoriaPrincipal, setCategoriaPrincipal] = useState("");
  const [categoriasBanco, setCategoriasBanco] = useState<CategoriaBanco[]>([]);
  const [carregandoCategorias, setCarregandoCategorias] = useState(false);
  const [carregandoProfissional, setCarregandoProfissional] = useState(false);
  const [sucessoProfissional, setSucessoProfissional] = useState(false);
  const [erroProfissional, setErroProfissional] = useState("");
  const [tagsSelecionadas, setTagsSelecionadas] = useState<number[]>([]);
  const [dropdownTagsAberto, setDropdownTagsAberto] = useState(false);

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
  const [tema, setTema] = useState("sistema");
  const [idioma, setIdioma] = useState("pt-BR");
  const [moeda, setMoeda] = useState("BRL");
  const [resumoAtividades, setResumoAtividades] = useState("semanal");

  // Estados da Aba de Suporte (Formulário)
  const [suporteTipo, setSuporteTipo] = useState("");
  const [suporteData, setSuporteData] = useState("");
  const [suporteAssunto, setSuporteAssunto] = useState("");
  const [suporteDescricao, setSuporteDescricao] = useState("");
  const [suporteArquivo, setSuporteArquivo] = useState<File | null>(null);

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

  useEffect(() => {
    async function carregarCategorias() {
      setCarregandoCategorias(true);

      try {
        const res = await fetch("/api/categoria");
        const dados = await res.json();
        setCategoriasBanco(Array.isArray(dados) ? dados : []);
      } catch {
        setCategoriasBanco([]);
      } finally {
        setCarregandoCategorias(false);
      }
    }

    carregarCategorias();
  }, []);

  useEffect(() => {
    async function carregarProfissional() {
      if (!user?.isPrestador || !user?.id) return;

      try {
        const res = await fetch(`/api/prestador/${user.id}`);
        const dados = await res.json();

        if (!res.ok) return;

        setDescricaoProfissional(dados.descricao_profissional || "");
        setCategoriaPrincipal(dados.categoria_principal || "");
        setTagsSelecionadas(
          Array.isArray(dados.categorias_vinculadas)
            ? dados.categorias_vinculadas.map((cat: CategoriaVinculada) => Number(cat.id_categoria)).filter(Boolean)
            : []
        );
      } catch {
        setTagsSelecionadas([]);
      }
    }

    carregarProfissional();
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

  const handleSalvarProfissional = async () => {
    if (!user?.id) return;
    setCarregandoProfissional(true);
    setSucessoProfissional(false);
    setErroProfissional("");
    try {
      const categoriaAtual = categoriasBanco.find((cat) => cat.nome_categoria === categoriaPrincipal);
      const idsTags = tagsSelecionadas.filter((idCategoria) => idCategoria !== categoriaAtual?.id_categoria);

      const res = await fetch(`/api/prestador/por-usuario/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricao_profissional: descricaoProfissional,
          categoria_principal: categoriaPrincipal,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");

      const resTags = await fetch("/api/tag", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_prestador: user.id,
          id_categorias: idsTags,
        }),
      });
      if (!resTags.ok) throw new Error("Erro ao salvar tags");

      setTagsSelecionadas(idsTags);
      setSucessoProfissional(true);
    } catch {
      setErroProfissional("Erro ao salvar informações profissionais.");
    } finally {
      setCarregandoProfissional(false);
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
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSucesso(true);
    } catch (error) {
      setErroMensagem("Erro ao salvar preferências.");
    } finally {
      setCarregando(false);
    }
  };

  const handleEnviarSuporte = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setSucesso(false);
    setErroMensagem("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSucesso(true);
      setSuporteTipo("");
      setSuporteData("");
      setSuporteAssunto("");
      setSuporteDescricao("");
      setSuporteArquivo(null);
    } catch (error) {
      setErroMensagem("Erro ao enviar o chamado técnico.");
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
        {/* Menu Lateral de Abas */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
          {[
            { id: "perfil", icon: User, label: "Editar perfil", sub: "Suas informações pessoais" },
            ...(user?.isPrestador ? [{ id: "profissional", icon: Briefcase, label: "Informações profissionais", sub: "Dados do seu perfil de prestador" }] : []),
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

        {/* Painel de Conteúdo Principal */}
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Cidade</label>
                  <input type="text" value={cidade} placeholder="Ex: Garanhuns" onChange={(e) => setCidade(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition" />
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

       {abaAtiva === "profissional" && (
  <div className="space-y-6">
    <div>
      <h2 className="text-lg font-bold text-gray-900">Informações Profissionais</h2>
      <p className="text-sm text-gray-500">Configure como seu perfil de prestador aparece para os clientes.</p>
    </div>

    <div className="space-y-5">

      {/* Categoria Principal */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-gray-700">Categoria principal</label>
        <select
          value={categoriaPrincipal}
          onChange={(e) => {
            setCategoriaPrincipal(e.target.value);
            const categoriaEscolhida = categoriasBanco.find((cat) => cat.nome_categoria === e.target.value);
            if (categoriaEscolhida) {
              setTagsSelecionadas((tags) => tags.filter((id) => id !== categoriaEscolhida.id_categoria));
            }
          }}
          disabled={carregandoCategorias || categoriasBanco.length === 0}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 transition disabled:opacity-60"
        >
          <option value="">
            {carregandoCategorias ? "Carregando categorias..." : "Selecione uma categoria"}
          </option>
          {categoriasBanco.map((cat) => (
            <option key={cat.id_categoria} value={cat.nome_categoria}>
              {cat.nome_categoria}
            </option>
          ))}
        </select>
      </div>

      {/* Tags / Categorias secundárias */}
      <div className="relative flex flex-col gap-2">
        <label className="text-xs font-bold text-gray-700">Categorias secundárias</label>
        <button
          type="button"
          onClick={() => setDropdownTagsAberto((aberto) => !aberto)}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-700 transition hover:border-blue-400"
        >
          <span>
            {tagsSelecionadas.length > 0
              ? `${tagsSelecionadas.length} selecionada(s)`
              : "Selecione as categorias secundárias"}
          </span>
          <span className="text-xs text-gray-400">{dropdownTagsAberto ? "▲" : "▼"}</span>
        </button>

        {dropdownTagsAberto && (
          <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
            {categoriasBanco.filter((cat) => cat.nome_categoria !== categoriaPrincipal).length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-400">Nenhuma categoria disponível.</p>
            ) : (
              categoriasBanco
                .filter((cat) => cat.nome_categoria !== categoriaPrincipal)
                .map((cat) => {
                  const selecionado = tagsSelecionadas.includes(cat.id_categoria);
                  return (
                    <label
                      key={cat.id_categoria}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      <input
                        type="checkbox"
                        checked={selecionado}
                        onChange={() => {
                          setTagsSelecionadas(prev =>
                            selecionado
                              ? prev.filter(id => id !== cat.id_categoria)
                              : [...prev, cat.id_categoria]
                          );
                        }}
                        className="h-4 w-4 accent-blue-600"
                      />
                      <span>{cat.nome_categoria}</span>
                    </label>
                  );
                })
            )}
          </div>
        )}
      </div>

      {/* Descrição profissional */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-gray-700">Descrição profissional</label>
        <textarea
          rows={5}
          value={descricaoProfissional}
          onChange={(e) => setDescricaoProfissional(e.target.value)}
          placeholder="Fale sobre sua experiência, especialidades e diferenciais..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition resize-none"
        />
        <p className="text-[10px] text-gray-400">{descricaoProfissional.length}/500 caracteres</p>
      </div>
    </div>

    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
      <div>
        {sucessoProfissional && <span className="text-xs text-green-600 font-bold">✓ Informações salvas com sucesso!</span>}
        {erroProfissional && <span className="text-xs text-red-500 font-bold">✗ {erroProfissional}</span>}
      </div>
      <button
        type="button"
        onClick={handleSalvarProfissional}
        disabled={carregandoProfissional}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2"
      >
        {carregandoProfissional && <Loader2 size={16} className="animate-spin" />}
        Salvar informações
      </button>
    </div>
  </div>
)}*

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

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Novidades e Promoções</p>
                      <p className="text-xs text-gray-400">Receba novidades do Benvi, dicas profissionais e ofertas especiais.</p>
                    </div>
                    <button type="button" onClick={() => setNotifEmailNovidades(!notifEmailNovidades)} className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${notifEmailNovidades ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${notifEmailNovidades ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                <div className="py-4 space-y-4">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Alertas no Navegador (Push)</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Chat em tempo real</p>
                      <p className="text-xs text-gray-400">Exibir balões de notificação na tela sempre que receber novas mensagens.</p>
                    </div>
                    <button type="button" onClick={() => setNotifPushMensagens(!notifPushMensagens)} className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${notifPushMensagens ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${notifPushMensagens ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Mudanças de status</p>
                      <p className="text-xs text-gray-400">Notificar imediatamente na tela quando um pedido mudar de andamento.</p>
                    </div>
                    <button type="button" onClick={() => setNotifPushStatus(!notifPushStatus)} className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${notifPushStatus ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${notifPushStatus ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div>
                  {sucesso && <span className="text-xs text-green-600 font-bold">✓ Preferências salvas!</span>}
                  {erroMensagem && <span className="text-xs text-red-500 font-bold">✗ {erroMensagem}</span>}
                </div>
                <button type="button" onClick={handleSalvarNotificacoes} disabled={carregando} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2">
                  {carregando && <Loader2 size={16} className="animate-spin" />}
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

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Exibir número de telefone público</p>
                      <p className="text-xs text-gray-400">Mostrar seu número diretamente no perfil sem precisar de abertura de chat.</p>
                    </div>
                    <button type="button" onClick={() => setMostrarTelefone(!mostrarTelefone)} className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${mostrarTelefone ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${mostrarTelefone ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                <div className="py-4 space-y-4">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Dados e Inteligência</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Exibir histórico de serviços realizados</p>
                      <p className="text-xs text-gray-400">Permitir que novos clientes vejam a quantidade de serviços que você já concluiu com sucesso.</p>
                    </div>
                    <button type="button" onClick={() => setMostrarHistorico(!mostrarHistorico)} className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${mostrarHistorico ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${mostrarHistorico ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Análise de IA para otimização de perfil</p>
                      <p className="text-xs text-gray-400">Usar seus dados de serviços de forma anônima para receber sugestões automáticas de melhorias de preço e portfólio.</p>
                    </div>
                    <button type="button" onClick={() => setPermitirDicasAI(!permitirDicasAI)} className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${permitirDicasAI ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${permitirDicasAI ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div>
                  {sucesso && <span className="text-xs text-green-600 font-bold">✓ Opções de privacidade salvas!</span>}
                  {erroMensagem && <span className="text-xs text-red-500 font-bold">✗ {erroMensagem}</span>}
                </div>
                <button type="button" onClick={handleSalvarPrivacidade} disabled={carregando} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2">
                  {carregando && <Loader2 size={16} className="animate-spin" />}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Idioma padrão</label>
                    <select value={idioma} onChange={(e) => setIdioma(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 transition">
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en">English (US)</option>
                      <option value="es">Español</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Moeda de exibição</label>
                    <select value={moeda} onChange={(e) => setMoeda(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 transition">
                      <option value="BRL">Real Brasileiro (R$)</option>
                      <option value="USD">Dólar Americano ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-2">
                  <label className="text-xs font-bold text-gray-700">Resumo de Atividades por E-mail</label>
                  <p className="text-[11px] text-gray-400 mb-1">Com que frequência deseja receber o consolidado de visitas ao perfil e orçamentos?</p>
                  <select value={resumoAtividades} onChange={(e) => setResumoAtividades(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 transition">
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
                <button type="button" onClick={handleSalvarPreferencias} disabled={carregando} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2">
                  {carregando && <Loader2 size={16} className="animate-spin" />}
                  Salvar preferências
                </button>
              </div>
            </div>
          )}

          {/* ABA SUPORTE E AJUDA */}
          {abaAtiva === "suporte" && (
            <div className="space-y-8 font-sans">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ajuda</h2>
                <p className="text-sm text-gray-500 mt-1">Encontre suporte, tire dúvidas ou reporte um problema na plataforma</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-100 bg-white rounded-2xl p-5 flex flex-col items-start gap-3 shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <Headphones size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Pedir Ajuda</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">Fale com o suporte da Benvi para tirar dúvidas sobre sua conta, serviços ou pagamentos.</p>
                  </div>
                  <button type="button" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition">
                    ENTRAR EM CONTATO
                  </button>
                </div>

                <div className="border border-gray-100 bg-white rounded-2xl p-5 flex flex-col items-start gap-3 shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <Bug size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Reportar Problema</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">Encontrou um erro? Problema com cliente ou dificuldade na plataforma? Nos avise.</p>
                  </div>
                  <button type="button" className="w-full mt-2 border border-blue-600 text-blue-600 hover:bg-blue-50/50 text-xs font-bold py-2.5 px-4 rounded-xl transition">
                    Reportar agora
                  </button>
                </div>

                <div className="border border-gray-100 bg-white rounded-2xl p-5 flex flex-col items-start gap-3 shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Dúvidas frequentes</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">Veja respostas rápidas para as dúvidas mais comuns dos prestadores.</p>
                  </div>
                  <button type="button" className="w-full mt-2 border border-blue-600 text-blue-600 hover:bg-blue-50/50 text-xs font-bold py-2.5 px-4 rounded-xl transition">
                    Ver FAQ
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                <form onSubmit={handleEnviarSuporte} className="lg:col-span-3 border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm bg-white">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Reportar problema</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Preencha os dados abaixo para enviar seu relato</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700">Tipo de problema</label>
                      <select value={suporteTipo} onChange={(e) => setSuporteTipo(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 transition">
                        <option value="">Selecione uma opção</option>
                        <option value="pagamento">Pagamento</option>
                        <option value="plataforma">Bug na plataforma</option>
                        <option value="perfil">Problemas com o perfil</option>
                        <option value="outro">Outros</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700">Data do ocorrido:</label>
                      <input type="date" value={suporteData} onChange={(e) => setSuporteData(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Assunto:</label>
                    <input type="text" value={suporteAssunto} onChange={(e) => setSuporteAssunto(e.target.value)} placeholder="Resuma brevemente o problema" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Descreva o problema:</label>
                    <textarea rows={4} value={suporteDescricao} onChange={(e) => setSuporteDescricao(e.target.value)} placeholder="Detalhes sobre o que aconteceu..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition resize-none" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Anexar imagem ou arquivo</label>
                    <div onClick={() => uploadSuporteRef.current?.click()} className="border border-dashed border-blue-300 bg-blue-50/20 rounded-xl p-4 text-center cursor-pointer hover:bg-blue-50/50 transition flex flex-col items-center justify-center gap-1">
                      <Upload size={20} className="text-blue-500" />
                      <p className="text-xs text-gray-600 font-medium">
                        {suporteArquivo ? suporteArquivo.name : "Clique para anexar ou arraste o arquivo até aqui"}
                      </p>
                      <p className="text-[10px] text-gray-400">JPG, PNG OU PDF até 10 mb</p>
                    </div>
                    <input type="file" ref={uploadSuporteRef} onChange={(e) => setSuporteArquivo(e.target.files?.[0] || null)} accept="image/*,application/pdf" className="hidden" />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      {sucesso && <span className="text-xs text-green-600 font-bold">✓ Chamado enviado!</span>}
                      {erroMensagem && <span className="text-xs text-red-500 font-bold">✗ {erroMensagem}</span>}
                    </div>
                    <button type="submit" disabled={carregando} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition flex items-center gap-2">
                      {carregando && <Loader2 size={14} className="animate-spin" />}
                      Enviar
                    </button>
                  </div>
                </form>

                <div className="lg:col-span-2 space-y-4 w-full">
                  <div className="border border-gray-100 rounded-2xl p-5 space-y-3 shadow-sm bg-white">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Falar com suporte</h3>
                      <p className="text-[11px] text-gray-400">Escolha o canal que preferir</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <MessageSquare size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800">Chat do suporte</p>
                            <p className="text-[10px] text-gray-400">Atendimento rápido pelo site</p>
                          </div>
                        </div>
                        <button type="button" className="border border-gray-200 bg-white hover:bg-gray-50 text-[10px] font-bold px-3 py-1.5 rounded-lg text-gray-700 transition">
                          Abrir chat
                        </button>
                      </div>

                      <div className="flex items-center justify-between border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <Mail size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800">E-mail</p>
                            <p className="text-[10px] text-gray-400">suporte@benvi.com</p>
                          </div>
                        </div>
                        <button type="button" className="border border-gray-200 bg-white hover:bg-gray-50 text-[10px] font-bold px-3 py-1.5 rounded-lg text-gray-700 transition">
                          Enviar e-mail
                        </button>
                      </div>

                      <div className="flex items-center border border-gray-100 rounded-xl p-3 bg-gray-50/50 gap-2.5">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                          <Phone size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">Telefone</p>
                          <p className="text-[10px] text-gray-400">0800 000 0000</p>
                          <p className="text-[9px] text-gray-400 font-light">Segunda a sexta, das 8h às 18h</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Meus chamados recentes</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            <th className="pb-2">Protocolo</th>
                            <th className="pb-2">Assunto</th>
                            <th className="pb-2">Data</th>
                            <th className="pb-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                          <tr>
                            <td className="py-2.5 font-medium text-gray-500">#12457</td>
                            <td className="py-2.5 font-semibold">Pagamento</td>
                            <td className="py-2.5 text-gray-400">22/05/2026</td>
                            <td className="py-2.5 text-right">
                              <span className="bg-orange-50 text-orange-600 font-bold text-[9px] px-2 py-0.5 rounded-full">Pendente</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-medium text-gray-500">#12657</td>
                            <td className="py-2.5 font-semibold">Pagamento</td>
                            <td className="py-2.5 text-gray-400">29/04/2026</td>
                            <td className="py-2.5 text-right">
                              <span className="bg-green-50 text-green-600 font-bold text-[9px] px-2 py-0.5 rounded-full">Concluído</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 font-medium text-gray-500">#12459</td>
                            <td className="py-2.5 font-semibold">Pagamento</td>
                            <td className="py-2.5 text-gray-400">15/03/2026</td>
                            <td className="py-2.5 text-right">
                              <span className="bg-blue-50 text-blue-600 font-bold text-[9px] px-2 py-0.5 rounded-full">Análise</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}