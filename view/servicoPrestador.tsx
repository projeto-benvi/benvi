'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, MoreVertical, Clock, Users, MapPin, Calendar, Check, Trash2, AlertTriangle, X,
  CheckCircle, XCircle, Star, MessageSquare 
} from 'lucide-react';

import SearchBar from '@/components/searchBar'; 

interface ServicoRetorno {
  id_servico: number;
  id_prestador?: number;
  id_categoria?: number;
  nome_categoria?: string;
  titulo: string;
  descricao: string;
  status_servico: string; 
  imagens?: string | string[];
}

interface CategoriaRetorno {
  id_categoria: number;
  nome_categoria: string;
  descricao?: string;
}

interface SolicitacaoRetorno {
  id_solicitacao: number;
  id_usuario?: number;
  id_prestador?: number;
  endereco?: string;
  data_solicitacao: string | Date;
  data_agendamento?: string | Date;
  status: boolean | number; 
  descricao_servico?: string;
  complemento: string;
  nome_usuario?: string;
}

export default function ServicoPrestador() {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [services, setServices] = useState<ServicoRetorno[]>([]);
  const [categorias, setCategorias] = useState<CategoriaRetorno[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoRetorno[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | 'Todos'>('Todos');
  const [loading, setLoading] = useState(true);
  
  const [solicitacaoParaRecusar, setSolicitacaoParaRecusar] = useState<SolicitacaoRetorno | null>(null);

  // Estado para controlar qual serviço está sendo avaliado no Modal
  const [servicoParaAvaliar, setServicoParaAvaliar] = useState<ServicoRetorno | null>(null);
  
  // Estados dos campos do formulário de avaliação baseados na image_42a9eb.png
  const [notaGeral, setNotaGeral] = useState(5);
  const [comentario, setComentario] = useState('');
  const [notasCriterios, setNotasCriterios] = useState({
    comunicacao: 5,
    respeito: 5,
    pontualidade: 5,
    acordo: 5
  });

  // Estado para controlar o Alerta Flutuante (Toast) corrigido da image_42a252.png
  const [alertConfig, setAlertConfig] = useState<{
    visivel: boolean;
    mensagem: string;
    tipo: 'success' | 'error';
  }>({ visivel: false, mensagem: '', tipo: 'success' });

  const dispararAlerta = (mensagem: string, tipo: 'success' | 'error' = 'success') => {
    setAlertConfig({ visivel: true, mensagem, tipo });
    setTimeout(() => {
      setAlertConfig(prev => ({ ...prev, visivel: false }));
    }, 3500);
  };

  const solicitacoesPendentes = solicitacoes.filter(
    solicitacao => solicitacao.status === false || solicitacao.status === 0
  );

  async function carregarDadosDoBanco() {
    try {
      setLoading(true);
      const [resServicos, resCategorias, resSolicitacoes] = await Promise.all([
        fetch('/api/servico'),
        fetch('/api/categoria'),
        fetch('/api/solicitacaoservico') 
      ]);

      if (resServicos.ok) {
        const dadosServicos = await resServicos.json();
        if (Array.isArray(dadosServicos)) setServices(dadosServicos);
      }
      if (resCategorias.ok) {
        const dadosCategorias = await resCategorias.json();
        if (Array.isArray(dadosCategorias)) setCategorias(dadosCategorias);
      }
      if (resSolicitacoes.ok) {
        const dadosSolicitacoes = await resSolicitacoes.json();
        if (Array.isArray(dadosSolicitacoes)) setSolicitacoes(dadosSolicitacoes);
      }
    } catch (error) {
      console.error('Erro ao conectar com o banco de dados:', error);
      dispararAlerta("Erro de rede ao carregar os dados.", "error");
    } finally {
      setLoading(false);
    }
  }

  // Aceitar solicitação e transferir imediatamente para a lista de Pendentes
  async function aceitarSolicitacao(solicitacao: SolicitacaoRetorno) {
    try {
      const response = await fetch(`/api/solicitacaoservico/${solicitacao.id_solicitacao}`, {
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 1,
          id_usuario: solicitacao.id_usuario || 1, 
          id_prestador: solicitacao.id_prestador || 1,
          complemento: solicitacao.complemento || "Sem complemento"
        }) 
      });

      if (response.ok) {
        setSolicitacoes(prev => prev.filter(item => item.id_solicitacao !== solicitacao.id_solicitacao));
        
        const novoServicoPendente: ServicoRetorno = {
          id_servico: solicitacao.id_solicitacao,
          titulo: solicitacao.nome_usuario ? `Serviço para ${solicitacao.nome_usuario}` : 'Novo Serviço Aceito',
          descricao: solicitacao.descricao_servico || 'Sem descrição fornecida',
          status_servico: 'pendente'
        };

        setServices(prev => [novoServicoPendente, ...prev]);
        dispararAlerta("Solicitação aceita e movida para os serviços pendentes!", "success");
      } else {
        dispararAlerta("Não foi possível aceitar esta solicitação.", "error");
      }
    } catch (error) {
      dispararAlerta("Erro de conexão ao aceitar solicitação.", "error");
    }
  }

  // Recusar/Deletar solicitação
  async function confirmarRecusarSolicitacao() {
    if (!solicitacaoParaRecusar) return;

    try {
      const response = await fetch(`/api/solicitacaoservico/${solicitacaoParaRecusar.id_solicitacao}`, {
        method: 'DELETE' 
      });

      if (response.ok) {
        setSolicitacoes(prev => prev.filter(item => item.id_solicitacao !== solicitacaoParaRecusar.id_solicitacao));
        setSolicitacaoParaRecusar(null);
        dispararAlerta("Solicitação recusada com sucesso.", "success");
      } else {
        dispararAlerta("Erro ao recusar a solicitação no servidor.", "error");
      }
    } catch (error) {
      dispararAlerta("Erro de rede ao recusar solicitação.", "error");
    }
  }

  // Concluir serviço e alterar o estado local para refletir na aba Concluídos
  async function concluirServico(id_servico: number) {
    try {
      const response = await fetch(`/api/servico/${id_servico}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_servico: 'concluido' })
      });

      if (response.ok) {
        setServices(prev => 
          prev.map(service => 
            service.id_servico === id_servico 
              ? { ...service, status_servico: 'concluido' } 
              : service
          )
        );
        dispararAlerta("Serviço concluído com sucesso! Bom trabalho.", "success");
      } else {
        dispararAlerta("Falha ao atualizar o status do serviço.", "error");
      }
    } catch (error) {
      dispararAlerta("Erro de rede ao concluir o serviço.", "error");
    }
  }

  async function enviarAvaliacao() {
    if (!servicoParaAvaliar) return;

    try {
      // 1. Encontra a solicitação para capturar o ID do usuário comum (cliente)
      const solicitacaoCorrespondente = solicitacoes.find(
        sol => Number(sol.id_solicitacao) === Number(servicoParaAvaliar.id_servico)
      );

      let idUsuarioCliente = solicitacaoCorrespondente?.id_usuario || (servicoParaAvaliar as any).id_usuario;
      if (!idUsuarioCliente && solicitacoes.length > 0) {
        idUsuarioCliente = solicitacoes[0].id_usuario; // Fallback
      }

      if (!idUsuarioCliente) {
        dispararAlerta("Não foi possível localizar o ID do cliente para vincular a avaliação.", "error");
        return;
      }

      // 2. Dados normais do formulário
      const dadosParaEnviar = {
        id_servico: Number(servicoParaAvaliar.id_servico),
        nota_geral: Number(notaGeral),
        comentario: comentario.trim(),
        comunicacao: Number(notasCriterios.comunicacao),
        respeito: Number(notasCriterios.respeito),
        pontualidade: Number(notasCriterios.pontualidade),
        acordo: Number(notasCriterios.acordo)
      };

      // 3. CORREÇÃO DA ROTA: Enviando para /api/avaliacoes/[id_do_cliente]
      // (Se o seu backend esperar o ID do serviço na URL em vez do ID do cliente, mude para id_servico)
      const urlDinamica = `/api/avaliacoes/${idUsuarioCliente}`;
      
      console.log(`Enviando requisição para a rota dinâmica: ${urlDinamica}`, dadosParaEnviar);

      const response = await fetch(urlDinamica, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaEnviar)
      });

      if (!response.ok) {
        const dadosErro = await response.json().catch(() => ({}));
        console.error("O backend rejeitou a rota dinâmica:", dadosErro);
        dispararAlerta(dadosErro.error || dadosErro.mensagem || "Erro ao salvar a avaliação.", "error");
        return;
      }

      // Sucesso total
      dispararAlerta("Avaliação do cliente enviada com sucesso!", "success");
      setServicoParaAvaliar(null);
      
      // Reset do bloco de notas
      setNotaGeral(5);
      setComentario('');
      setNotasCriterios({ comunicacao: 5, respeito: 5, pontualidade: 5, acordo: 5 });

    } catch (error) {
      console.error("Erro de rede:", error);
      dispararAlerta("Erro de rede ao enviar avaliação.", "error");
    }
  }

  useEffect(() => {
    carregarDadosDoBanco();
  }, []);

  const filteredServices = services.filter(service => {
    const status = (service.status_servico || '').toLowerCase();
    let matchesStatus = true;
    if (activeFilter === 'Concluidos') matchesStatus = status === 'concluido';
    if (activeFilter === 'Pendente') matchesStatus = status === 'pendente' || status === 'ativo';

    let matchesCategory = true;
    if (activeCategory !== 'Todos') {
      matchesCategory = service.id_categoria === activeCategory;
    }

    return matchesStatus && matchesCategory;
  });

  // Função auxiliar para renderizar estrelas clicáveis
  const RenderEstrelasClicaveis = ({ valorAtual, onChange }: { valorAtual: number, onChange: (v: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((estrela) => (
          <button
            key={estrela}
            type="button"
            onClick={() => onChange(estrela)}
            className="cursor-pointer transition-transform hover:scale-110"
          >
            <Star 
              size={22} 
              className={estrela <= valorAtual ? "fill-amber-400 text-amber-400" : "text-gray-300"} 
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="h-screen bg-[#f4f7fe] flex flex-col font-sans text-gray-800 overflow-hidden relative">
      <SearchBar />

      <div className="flex-1 max-w-[1440px] w-full mx-auto p-8 flex gap-6 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-start pb-4 shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-[#1b2559]">
                {activeFilter === 'Solicitacoes' ? 'Solicitações Recebidas' : 'Meus Serviços'}
              </h1>
            </div>
            <button className="bg-[#4318ff] text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 cursor-pointer">
              <Plus size={18} /> Adicionar Serviços
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-3 pb-6 shrink-0">
            {['Todos', 'Concluidos', 'Pendente'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-xl text-sm font-medium border cursor-pointer ${
                  activeFilter === filter 
                    ? 'bg-[#e0e7ff] text-[#4318ff] border-transparent font-bold' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {filter}
              </button>
            ))}
            
            <button 
              onClick={() => setActiveFilter('Solicitacoes')}
              className={`px-6 py-2 rounded-xl text-sm font-medium border relative cursor-pointer ${
                activeFilter === 'Solicitacoes'
                  ? 'bg-[#e0e7ff] text-[#4318ff] border-transparent font-bold'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Solicitações
              {solicitacoesPendentes.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#b91c1c] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {solicitacoesPendentes.length}
                </span>
              )}
            </button>
          </div>

          {/* Lista Principal */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="text-xs text-gray-400 text-center py-8">Carregando dados...</div>
            ) : activeFilter === 'Solicitacoes' ? (
              
              /* LISTAGEM DE SOLICITAÇÕES */
              solicitacoesPendentes.length === 0 ? (
                <div className="text-xs text-gray-400 text-center py-12">Nenhuma solicitação pendente.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {solicitacoesPendentes.map((solicitacao) => (
                    <div key={solicitacao.id_solicitacao} className="p-5 flex gap-4 items-center justify-between bg-white hover:bg-gray-50/50 transition-colors">
                      <div className="flex gap-4 items-center flex-1">
                        <div className="w-24 h-20 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center font-bold text-xl uppercase">
                          {(solicitacao.nome_usuario || 'C').charAt(0)}
                        </div>
                        <div className="space-y-1 flex-1">
                          <h3 className="font-bold text-[#1b2559] text-base">{solicitacao.nome_usuario || 'Cliente'}</h3>
                          <p className="text-xs text-gray-400 max-w-xl line-clamp-1">{solicitacao.descricao_servico}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 min-w-[200px] justify-end">
                        <button 
                          onClick={() => setSolicitacaoParaRecusar(solicitacao)} 
                          className="flex items-center gap-1 px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl cursor-pointer"
                        >
                          <Trash2 size={14} /> Recusar
                        </button>
                        <button 
                          onClick={() => aceitarSolicitacao(solicitacao)}
                          className="flex items-center gap-1 px-4 py-2 bg-[#4318ff] text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          <Check size={14} /> Aceitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              
              /* LISTAGEM DE MEUS SERVIÇOS */
              filteredServices.length === 0 ? (
                <div className="text-xs text-gray-400 text-center py-8">Nenhum serviço para exibir.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredServices.map((service) => {
                    const statusLower = (service.status_servico || '').toLowerCase();
                    const isPendente = statusLower === 'pendente' || statusLower === 'ativo';

                    return (
                      <div key={service.id_servico} className="p-5 flex gap-4 items-center justify-between bg-white hover:bg-gray-50/50 transition-colors">
                        <div className="flex gap-4 items-center flex-1">
                          <div className="w-24 h-20 bg-[#d9d9d9] rounded-xl"></div>
                          <div className="space-y-1 flex-1">
                            <h3 className="font-bold text-[#1b2559] text-base">{service.titulo}</h3>
                            <p className="text-xs text-gray-400 max-w-xl line-clamp-1">{service.descricao}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between h-20 min-w-[120px]">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            isPendente ? 'bg-[#ffeada] text-[#f97316]' : 'bg-[#def7ec] text-[#03543f]'
                          }`}>
                            {isPendente ? 'Pendente' : 'concluido'}
                          </span>

                          {isPendente ? (
                            <button 
                              onClick={() => concluirServico(service.id_servico)}
                              className="bg-[#3b82f6] text-white text-xs font-bold px-6 py-2 rounded-xl w-full text-center cursor-pointer"
                            >
                              Concluir
                            </button>
                          ) : (
                            <button 
                              onClick={() => setServicoParaAvaliar(service)}
                              className="bg-[#f97316] text-white text-xs font-bold px-6 py-2 rounded-xl w-full text-center cursor-pointer hover:bg-[#e06613] transition-colors"
                            >
                              Avaliar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>

        {/* COLUNA DIREITA */}
<div className="w-80 space-y-6 shrink-0 hidden lg:flex flex-col">

  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
  <h4 className="font-semibold text-[#1b2559] text-sm mb-4">
    Dicas para seus serviços
  </h4>

  {/* BOX AZUL */}
  <div className="bg-[#e9efff] border border-[#c7d2fe] rounded-xl p-3 flex gap-3 items-start mb-4">
    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#dbeafe] text-[#4318ff] text-xs font-bold">
      i
    </div>
    <p className="text-[11px] text-[#1e3a8a] leading-snug font-medium">
      Serviços bem descritos e com fotos reais recebem até <strong>3x mais solicitações!</strong>
    </p>
  </div>

  {/* LISTA */}
  <div className="space-y-3">
    
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <span className="w-4 h-4 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-[10px]">
        ✓
      </span>
      Adicione fotos de qualidade
    </div>

    <div className="flex items-center gap-2 text-xs text-gray-600">
      <span className="w-4 h-4 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-[10px]">
        ✓
      </span>
      Descrição clara do serviço
    </div>

    <div className="flex items-center gap-2 text-xs text-gray-600">
      <span className="w-4 h-4 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-[10px]">
        ✓
      </span>
      Mantenha seus serviços atualizados
    </div>

  </div>
</div>

  {/* CATEGORIAS (AGORA FICA EMBAIXO) */}
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h4 className="font-bold text-[#1b2559] text-sm mb-4">Categorias</h4>

      <div className="space-y-1">
        <button 
          onClick={() => setActiveCategory('Todos')}
          className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-xs font-bold ${
            activeCategory === 'Todos'
              ? 'bg-[#e0e7ff] text-[#4318ff]'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <span>Todos os serviços</span>
          <span>{services.length}</span>
        </button>

        {categorias.map((cat) => (
          <button
            key={cat.id_categoria}
            onClick={() => setActiveCategory(cat.id_categoria)}
            className={`w-full flex justify-between items-center px-3 py-2 text-xs rounded-lg ${
              activeCategory === cat.id_categoria
                ? 'bg-[#e0e7ff] text-[#4318ff] font-bold'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span className="capitalize">{cat.nome_categoria.toLowerCase()}</span>
            <span>{services.filter(s => s.id_categoria === cat.id_categoria).length}</span>
          </button>
        ))}
      </div>
    </div>
</div>
      </div>

      {/* POP-UP DE CONFIRMAÇÃO DE RECUSA */}
      {solicitacaoParaRecusar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative flex flex-col gap-4">
            <button onClick={() => setSolicitacaoParaRecusar(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
              <X size={18} />
            </button>
            <div className="flex gap-3 items-start">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertTriangle size={24} /></div>
              <div>
                <h3 className="text-lg font-bold text-[#1b2559]">Recusar Solicitação?</h3>
                <p className="text-xs text-gray-400">Você removerá o pedido de <strong>{solicitacaoParaRecusar.nome_usuario}</strong> permanentemente.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setSolicitacaoParaRecusar(null)} className="px-4 py-2 border text-gray-600 font-bold text-xs rounded-xl cursor-pointer">Voltar</button>
              <button onClick={confirmarRecusarSolicitacao} className="px-5 py-2 bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer">Sim, recusar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE AVALIAÇÃO DO CLIENTE (FIEL À SUA IMAGEM image_42a9eb.png) */}
      {servicoParaAvaliar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl relative flex flex-col overflow-hidden my-auto border border-gray-100">
            
            {/* Header do Modal */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Avaliar cliente do serviço</h2>
              <button 
                onClick={() => setServicoParaAvaliar(null)} 
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              
              {/* Pergunta principal e Nota Geral */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">
                  Como você avalia esse cliente?
                </label>
                <div className="flex items-center gap-3">
                  <RenderEstrelasClicaveis valorAtual={notaGeral} onChange={setNotaGeral} />
                  <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-0.5 rounded-md">
                    {notaGeral === 5 ? 'Excelente!' : notaGeral === 4 ? 'Muito Bom' : notaGeral === 3 ? 'Regular' : notaGeral === 2 ? 'Ruim' : 'Péssimo'}
                  </span>
                </div>
              </div>

              {/* Comentário Opcional */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-gray-500">Deixe seu comentário (opcional)</span>
                </div>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value.slice(0, 500))}
                  placeholder="Conte um pouco sobre sua experiência com este cliente..."
                  className="w-full min-h-[100px] bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-amber-400 focus:bg-white transition-all resize-none"
                />
                <div className="text-right text-[10px] text-gray-400">
                  {comentario.length}/500
                </div>
              </div>

              {/* Critérios Específicos */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700">Avalie também os aspectos do serviço</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Comunicação */}
                  <div className="border border-gray-150 rounded-xl p-3 flex flex-col gap-1 bg-white shadow-sm">
                    <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-gray-400" /> Comunicação
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <RenderEstrelasClicaveis 
                        valorAtual={notasCriterios.comunicacao} 
                        onChange={(v) => setNotasCriterios(p => ({ ...p, comunicacao: v }))} 
                      />
                      <span className="text-[11px] font-bold text-gray-500">{notasCriterios.comunicacao.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Respeito e cordialidade */}
                  <div className="border border-gray-150 rounded-xl p-3 flex flex-col gap-1 bg-white shadow-sm">
                    <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                      <Users size={13} className="text-gray-400" /> Respeito e cordialidade
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <RenderEstrelasClicaveis 
                        valorAtual={notasCriterios.respeito} 
                        onChange={(v) => setNotasCriterios(p => ({ ...p, respeito: v }))} 
                      />
                      <span className="text-[11px] font-bold text-gray-500">{notasCriterios.respeito.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Pontualidade */}
                  <div className="border border-gray-150 rounded-xl p-3 flex flex-col gap-1 bg-white shadow-sm">
                    <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                      <Clock size={13} className="text-gray-400" /> Pontualidade
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <RenderEstrelasClicaveis 
                        valorAtual={notasCriterios.pontualidade} 
                        onChange={(v) => setNotasCriterios(p => ({ ...p, pontualidade: v }))} 
                      />
                      <span className="text-[11px] font-bold text-gray-500">{notasCriterios.pontualidade.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Facilidade no acordo */}
                  <div className="border border-gray-150 rounded-xl p-3 flex flex-col gap-1 bg-white shadow-sm">
                    <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                      <Check size={13} className="text-gray-400" /> Facilidade no acordo
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <RenderEstrelasClicaveis 
                        valorAtual={notasCriterios.acordo} 
                        onChange={(v) => setNotasCriterios(p => ({ ...p, acordo: v }))} 
                      />
                      <span className="text-[11px] font-bold text-gray-500">{notasCriterios.acordo.toFixed(1)}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Box de Informação de Privacidade */}
              <div className="bg-[#eff6ff] rounded-xl p-3.5 flex gap-3 items-start border border-[#bfdbfe]">
                <div className="text-blue-600 p-0.5 shrink-0"><CheckCircle size={18} className="fill-blue-50 text-blue-600" /></div>
                <p className="text-[11px] text-slate-600 leading-normal font-medium">
                  Sua avaliação é privada e não será compartilhada publicamente. Utilizamos essas informações para melhorar a experiência na plataforma.
                </p>
              </div>

            </div>

            {/* Rodapé de Ações */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setServicoParaAvaliar(null)}
                className="px-5 py-2 border border-gray-300 bg-white text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={enviarAvaliacao}
                className="px-6 py-2 bg-[#f97316] text-white font-semibold text-xs rounded-xl hover:bg-[#e06613] shadow-md transition-all cursor-pointer"
              >
                Enviar avaliação
              </button>
            </div>

          </div>
        </div>
      )}

      {/* COMPONENTE DE ALERTA FLUTUANTE (TOAST COORDENADO) */}
      {alertConfig.visivel && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-white border rounded-2xl p-4 shadow-xl max-w-sm transition-all duration-300 animate-slideIn select-none">
          {alertConfig.tipo === 'success' ? (
            <div className="text-green-500 bg-green-50 p-2 rounded-xl">
              <CheckCircle size={20} />
            </div>
          ) : (
            <div className="text-red-500 bg-red-50 p-2 rounded-xl">
              <XCircle size={20} />
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-800 leading-snug">
              {alertConfig.mensagem}
            </p>
          </div>
          <button 
            onClick={() => setAlertConfig(prev => ({ ...prev, visivel: false }))}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

    </div>
  );
}