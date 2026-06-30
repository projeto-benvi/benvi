// view/agendaPrestador.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import SearchBar from "@/components/searchBar";

interface Agendamento {
  id: string | number;
  servico: string;
  clienteNome: string;
  diaSemana: number; // 0 = Seg, 1 = Ter, ... 6 = Dom
  horaInicio: string; 
  horaFim: string;    
  dataCompleta?: string; // Para identificar dias específicos no mês
}

interface AgendaApiItem {
  id_agenda?: number;
  id_prestador?: number | string;
  idPrestador?: number | string;
  id_usuario?: number | string;
  titulo?: string;
  descricao_servico?: string;
  nome_usuario?: string;
  horario_inicio?: string | Date;
  horario_fim?: string | Date;
  data_agendamento?: string | Date;
  prestador?: {
    id_usuario?: number | string;
    id_prestador?: number | string;
    id?: number | string;
  };
}

export type TipoVisualizacao = 'dia' | 'semana' | 'mes';

export default function AgendaPrestador() {
  const { data: session } = useSession();
  
  // ================= ESTADOS =================
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataAtual, setDataAtual] = useState(new Date()); 
  const [modalAberto, setModalAberto] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaData, setNovaData] = useState(new Date().toISOString().slice(0, 10));
  const [novaHoraInicio, setNovaHoraInicio] = useState("09:00");
  const [novaHoraFim, setNovaHoraFim] = useState("10:00");
  const [salvandoAgenda, setSalvandoAgenda] = useState(false);
  const [erroAgenda, setErroAgenda] = useState("");
  
  // Novos estados para controlar a visualização
  const [tipoVisualizacao, setTipoVisualizacao] = useState<TipoVisualizacao>('semana');
  const [menuVisualizacaoAberto, setMenuVisualizacaoAberto] = useState(false);

  const pad2 = (n: number) => n.toString().padStart(2, '0');
  const dataParaChave = (data: Date) => `${data.getFullYear()}-${pad2(data.getMonth() + 1)}-${pad2(data.getDate())}`;

  const parseDate = (valor?: string | Date) => {
    if (!valor) return null;
    const data = valor instanceof Date ? valor : new Date(valor);
    return Number.isNaN(data.getTime()) ? null : data;
  };

  const formatarHora = (valor?: string | Date) => {
    const data = parseDate(valor);
    if (data) return `${pad2(data.getHours())}:${pad2(data.getMinutes())}`;

    if (typeof valor === 'string') {
      const hora = valor.match(/(\d{2}:\d{2})/);
      if (hora) return hora[1];
    }

    return '00:00';
  };

  const stringTemDataCalendario = (valor?: string | Date) => {
    if (!valor || typeof valor !== 'string') return false;
    return /\d{4}-\d{2}-\d{2}/.test(valor);
  };

  const normalizarAgendamentos = (itens: AgendaApiItem[]): Agendamento[] => {
    return itens.map((item, index) => {
      const dataInicio = parseDate(item.horario_inicio);
      const temDataAgendamento = stringTemDataCalendario(item.data_agendamento);
      const temDataNoInicio = stringTemDataCalendario(item.horario_inicio);
      const dataBase = (temDataAgendamento ? parseDate(item.data_agendamento) : null) ?? (temDataNoInicio ? dataInicio : null);

      const dataValida = dataBase ?? new Date();
      const diaSemana = (dataValida.getDay() + 6) % 7;

      return {
        id: item.id_agenda ?? `agenda-${index}`,
        servico: item.titulo || item.descricao_servico || 'Serviço',
        clienteNome: item.nome_usuario || 'Cliente',
        diaSemana,
        horaInicio: formatarHora(item.horario_inicio),
        horaFim: formatarHora(item.horario_fim),
        dataCompleta: dataBase ? dataParaChave(dataValida) : undefined,
      };
    });
  };

  const obterIdPrestadorDoItem = (item: AgendaApiItem): number | null => {
    const candidatos = [
      item.id_prestador,
      item.idPrestador,
      item.prestador?.id_usuario,
      item.prestador?.id_prestador,
      item.prestador?.id,
    ];

    for (const candidato of candidatos) {
      const id = Number(candidato);
      if (Number.isFinite(id)) return id;
    }

    return null;
  };

  // ================= LÓGICA DE DATAS =================
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const nomesDias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
  
  const getInicioDaSemana = (data: Date) => {
    const d = new Date(data);
    const dia = d.getDay();
    const diff = d.getDate() - dia + (dia === 0 ? -6 : 1); 
    return new Date(d.setDate(diff));
  };

  const inicioDaSemana = getInicioDaSemana(dataAtual);
  
  const diasDaSemana = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(inicioDaSemana);
    d.setDate(inicioDaSemana.getDate() + i);
    return d;
  });

  // ================= NAVEGAÇÃO DINÂMICA =================
  const mudarPeriodo = (direcao: number) => {
    const novaData = new Date(dataAtual);
    if (tipoVisualizacao === 'dia') {
      novaData.setDate(dataAtual.getDate() + direcao);
    } else if (tipoVisualizacao === 'semana') {
      novaData.setDate(dataAtual.getDate() + (direcao * 7));
    } else if (tipoVisualizacao === 'mes') {
      novaData.setMonth(dataAtual.getMonth() + direcao);
    }
    setDataAtual(novaData);
  };

  const pularParaHoje = () => setDataAtual(new Date());

  // Textos de Cabeçalho Baseados na Visualização
  let textoPeriodo = "";
  if (tipoVisualizacao === 'dia') {
    textoPeriodo = `${dataAtual.getDate().toString().padStart(2, '0')} ${meses[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`;
  } else if (tipoVisualizacao === 'semana') {
    textoPeriodo = `${diasDaSemana[0].getDate().toString().padStart(2, '0')}-${diasDaSemana[6].getDate().toString().padStart(2, '0')} ${meses[inicioDaSemana.getMonth()]} ${inicioDaSemana.getFullYear()}`;
  } else {
    textoPeriodo = `${meses[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`;
  }

  // ================= LÓGICA DO MÊS (MINI CALENDÁRIO & GRADE) =================
  const gerarDiasDoMes = () => {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    let primeiroDiaDoMes = new Date(ano, mes, 1).getDay();
    primeiroDiaDoMes = primeiroDiaDoMes === 0 ? 6 : primeiroDiaDoMes - 1; // Ajuste para Seg=0
    
    const totalDiasNoMes = new Date(ano, mes + 1, 0).getDate();
    
    const dias = [];
    for (let i = 0; i < primeiroDiaDoMes; i++) dias.push({ dia: "", current: false, dataExata: null });
    for (let i = 1; i <= totalDiasNoMes; i++) {
      const d = new Date(ano, mes, i);
      const isCurrent = d.toDateString() === new Date().toDateString(); // Destaca o dia de hoje
      dias.push({ dia: i.toString().padStart(2, '0'), current: isCurrent, dataExata: d });
    }
    return dias;
  };
  const diasDoMesGrid = gerarDiasDoMes();


// ================= BUSCA DE DADOS =================
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const carregarAgenda = async () => {
      setLoading(true);
      const idUsuarioLogado = Number((session?.user as any)?.id);

      if (!Number.isFinite(idUsuarioLogado)) {
        setAgendamentos([]);
        setLoading(false);
        return;
      }

      try {
        let listaApi: AgendaApiItem[] = [];

        const responseFiltrada = await fetch(`/api/agenda?id_prestador=${idUsuarioLogado}`, { signal });
        if (responseFiltrada.ok) {
          const dadosFiltrados = await responseFiltrada.json();
          listaApi = Array.isArray(dadosFiltrados) ? dadosFiltrados : [];
        }

        if (listaApi.length === 0) {
          const responseGeral = await fetch('/api/agenda', { signal });
          if (responseGeral.ok) {
            const dadosGerais = await responseGeral.json();
            const listaGeral = Array.isArray(dadosGerais) ? dadosGerais : [];
            listaApi = listaGeral.filter((item: AgendaApiItem) => obterIdPrestadorDoItem(item) === idUsuarioLogado);

            if (listaApi.length === 0 && listaGeral.length > 0) {
              console.warn('Nenhum item da agenda possui id de prestador compativel com o usuario logado.', {
                idUsuarioLogado,
              });
            }
          }
        }

        const dadosNormalizados = normalizarAgendamentos(listaApi);
        setAgendamentos(dadosNormalizados);

      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Erro ao buscar agendamentos:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (session) carregarAgenda();

  return () => controller.abort(); // Cancela a requisição ao mudar de data/tipo
  }, [session, dataAtual, tipoVisualizacao]);

  const salvarNovoAgendamento = async (event: React.FormEvent) => {
  event.preventDefault();
  const idPrestador = Number((session?.user as any)?.id ?? 0);

  if (!idPrestador) {
    setErroAgenda("Não foi possível identificar o prestador logado.");
    return;
  }

  if (!novoTitulo.trim() || !novaData || !novaHoraInicio || !novaHoraFim) {
    setErroAgenda("Preencha título, data e horários.");
    return;
  }

  const inicio = new Date(novaData + "T" + novaHoraInicio + ":00");
  const fim = new Date(novaData + "T" + novaHoraFim + ":00");

  if (inicio >= fim) {
    setErroAgenda("O horário final precisa ser depois do início.");
    return;
  }

  setSalvandoAgenda(true);
  setErroAgenda("");

  try {
    const response = await fetch("/api/agenda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_prestador: idPrestador,
        horario_inicio: inicio.toISOString(),
        horario_fim: fim.toISOString(),
        status: "pendente",
        titulo: novoTitulo.trim(),
        descricao: "Agendamento criado manualmente pelo prestador.",
      }),
    });

    const dados = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(dados?.error || "Não foi possível salvar o agendamento.");

    setAgendamentos((prev) => [
      ...prev,
      {
        id: dados?.id_agenda || Date.now(),
        servico: novoTitulo.trim(),
        clienteNome: "Manual",
        diaSemana: (inicio.getDay() + 6) % 7,
        horaInicio: novaHoraInicio,
        horaFim: novaHoraFim,
        dataCompleta: novaData,
      },
    ]);

    setModalAberto(false);
    setNovoTitulo("");
    setNovaData(new Date().toISOString().slice(0, 10));
    setNovaHoraInicio("09:00");
    setNovaHoraFim("10:00");
  } catch (error) {
    setErroAgenda(error instanceof Error ? error.message : "Erro ao salvar agendamento.");
  } finally {
    setSalvandoAgenda(false);
  }
  };




  // ================= UTILS DA GRADE =================
  const hours = [
    "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", 
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
  ];
  const bgColors = ["bg-amber-400", "bg-emerald-400", "bg-sky-400", "bg-indigo-400", "bg-purple-400"];

  const converterHoraParaPixels = (timeStr: string): number => {
    const [horas, minutos] = timeStr.split(':').map(Number);
    return (horas + minutos / 60) * 80; 
  };

  const obterEstiloCard = (horaInicio: string, horaFim: string) => {
    const top = converterHoraParaPixels(horaInicio);
    const bottom = converterHoraParaPixels(horaFim);
    return { top: `${top}px`, height: `${Math.max(bottom - top, 40)}px` };
  };

  // Funções para lidar com o seletor de visualização
  const alterarVisualizacao = (tipo: TipoVisualizacao) => {
    setTipoVisualizacao(tipo);
    setMenuVisualizacaoAberto(false);
  };
  const getNomeVisualizacaoAtual = () => {
    if (tipoVisualizacao === 'dia') return 'Dia';
    if (tipoVisualizacao === 'semana') return 'Semana';
    return 'Mês';
  };

  const agendamentosPorData = (data: Date) => {
    const chaveData = dataParaChave(data);
    const diaSemana = (data.getDay() + 6) % 7;
    return agendamentos.filter((a) => {
      if (a.dataCompleta) return a.dataCompleta === chaveData;
      return a.diaSemana === diaSemana;
    });
  };


  return (
    <div className="flex flex-col h-screen w-full bg-white text-slate-800 font-sans overflow-hidden">
      
      <SearchBar />

      <div className="flex-1 flex overflow-hidden">
        
        {/* COLUNA ESQUERDA: MINI CALENDÁRIO */}
        <div className="w-64 border-r border-slate-100 p-6 shrink-0 overflow-y-auto bg-white hidden md:block">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">{meses[dataAtual.getMonth()]}</h3>
            <button 
              onClick={pularParaHoje}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-2 py-1 rounded-md"
            >
              Hoje
            </button>
          </div>
          
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 mb-2">
            <span>s</span><span>t</span><span>q</span><span>q</span><span>s</span><span>s</span><span>d</span>
          </div>

          <div className="grid grid-cols-7 text-center gap-y-2 text-xs font-medium text-slate-700">
            {diasDoMesGrid.map((item, idx) => {
              const isSelecionado = item.dataExata && item.dataExata.toDateString() === dataAtual.toDateString();
              return (
                <button 
                  key={idx} 
                  onClick={() => {
                    if (item.dataExata) {
                      setDataAtual(item.dataExata);
                      if (tipoVisualizacao === 'mes') setTipoVisualizacao('dia'); // Atalho: clicar no dia vai para a visão diária
                    }
                  }}
                  disabled={!item.dataExata}
                  className={`flex items-center justify-center h-7 w-7 mx-auto rounded-full transition-colors ${
                    isSelecionado ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-200" 
                    : item.current ? "bg-blue-100 text-blue-700 font-bold"
                    : item.dataExata ? "hover:bg-slate-100 cursor-pointer" 
                    : "cursor-default"
                  }`}
                >
                  {item.dia}
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUNA DIREITA: GRADE PRINCIPAL */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
          
          {/* TOPO DA GRADE */}
          <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-6">
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => mudarPeriodo(-1)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h2 className="text-xl font-bold text-slate-800 min-w-[200px] text-center">{textoPeriodo}</h2>
                <button 
                  onClick={() => mudarPeriodo(1)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              
              {/* FILTRO DROPDOWN FUNCIONAL */}
              <div className="relative">
                <button 
                  onClick={() => setMenuVisualizacaoAberto(!menuVisualizacaoAberto)}
                  className="flex items-center gap-2 border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50/50 hover:bg-blue-100 transition-colors w-28 justify-between"
                >
                  {getNomeVisualizacaoAtual()}
                  <svg className={`w-3 h-3 transition-transform ${menuVisualizacaoAberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {menuVisualizacaoAberto && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-slate-100 shadow-lg rounded-lg overflow-hidden z-50">
                    <button onClick={() => alterarVisualizacao('dia')} className={`w-full text-left px-4 py-2 text-sm ${tipoVisualizacao === 'dia' ? 'bg-blue-50 font-bold text-blue-600' : 'hover:bg-slate-50'}`}>Dia</button>
                    <button onClick={() => alterarVisualizacao('semana')} className={`w-full text-left px-4 py-2 text-sm ${tipoVisualizacao === 'semana' ? 'bg-blue-50 font-bold text-blue-600' : 'hover:bg-slate-50'}`}>Semana</button>
                    <button onClick={() => alterarVisualizacao('mes')} className={`w-full text-left px-4 py-2 text-sm ${tipoVisualizacao === 'mes' ? 'bg-blue-50 font-bold text-blue-600' : 'hover:bg-slate-50'}`}>Mês</button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm shadow-blue-100 transition-all"
                onClick={() => setModalAberto(true)}
              >
                Adicionar <span className="hidden sm:inline">agendamento</span> <span className="text-sm font-bold">+</span>
              </button>
            </div>
          </div>

          {/* ================= CORPO DA AGENDA ================= */}
          {tipoVisualizacao === 'mes' ? (
            
            /* VISUALIZAÇÃO DE MÊS (GRID) */
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              <div className="grid grid-cols-7 border-b border-slate-100 text-center text-xs font-bold text-slate-500 py-3 bg-slate-50/50">
                {nomesDias.map((dia, idx) => <div key={idx} className="uppercase tracking-wider">{dia}</div>)}
              </div>
              <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-100 gap-[1px]">
                {diasDoMesGrid.map((dia, idx) => (
                  <div key={idx} className={`bg-white p-2 ${dia.dataExata ? 'hover:bg-slate-50 transition-colors cursor-pointer' : ''}`}
                       onClick={() => { if(dia.dataExata) { setDataAtual(dia.dataExata); setTipoVisualizacao('dia'); } }}>
                    {dia.dataExata && (
                      <div className="flex flex-col h-full">
                        <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${dia.current ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                          {dia.dia}
                        </span>
                        {/* Indicadores de agendamentos para o mês poderiam ser mapeados aqui */}
                        <div className="mt-1 flex-1 overflow-y-auto space-y-1">
                          {agendamentosPorData(dia.dataExata).slice(0, 3).map((a, i) => (
                            <div key={i} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded truncate font-medium">
                              {a.horaInicio} {a.clienteNome}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          ) : (
            
            /* VISUALIZAÇÃO DE DIA E SEMANA (TIMELINE) */
            <div className="flex-1 overflow-y-auto relative bg-white">
              
              {/* CABEÇALHO DA TIMELINE */}
              <div className={`grid ${tipoVisualizacao === 'dia' ? 'grid-cols-[64px_1fr]' : 'grid-cols-[64px_1fr_1fr_1fr_1fr_1fr_1fr_1fr]'} border-b border-slate-100 sticky top-0 bg-white z-20 text-center text-xs font-semibold text-slate-500 py-3 shadow-sm`}>
                <div></div>
                {tipoVisualizacao === 'dia' ? (
                  // Cabeçalho de Dia Único
                  <div className="flex flex-col items-center gap-1 text-blue-600">
                    <span className="uppercase text-[10px] tracking-wider">{nomesDias[dataAtual.getDay() === 0 ? 6 : dataAtual.getDay() - 1]}</span>
                    <span className="text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white">
                      {dataAtual.getDate().toString().padStart(2, '0')}
                    </span>
                  </div>
                ) : (
                  // Cabeçalho de 7 Dias
                  diasDaSemana.map((dia, idx) => {
                    const isHoje = dia.toDateString() === new Date().toDateString();
                    return (
                      <div key={idx} className={`flex flex-col items-center gap-1 ${isHoje ? 'text-blue-600' : ''}`}>
                        <span className="uppercase text-[10px] tracking-wider">{nomesDias[idx]}</span>
                        <span className={`text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full ${isHoje ? 'bg-blue-600 text-white' : 'text-slate-800'}`}>
                          {dia.getDate().toString().padStart(2, '0')}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* GRID BODY (LINHAS DE HORÁRIOS) */}
              <div className={`relative grid ${tipoVisualizacao === 'dia' ? 'grid-cols-[64px_1fr]' : 'grid-cols-[64px_1fr_1fr_1fr_1fr_1fr_1fr_1fr]'}`}>
                {hours.map((hour, index) => (
                  <React.Fragment key={index}>
                    <div className="h-20 text-right pr-3 text-xs font-medium text-slate-400 pt-1 border-b border-dashed border-slate-100 select-none">
                      {hour}
                    </div>
                    {Array.from({ length: tipoVisualizacao === 'dia' ? 1 : 7 }).map((_, dIdx) => (
                      <div key={dIdx} className="h-20 border-l border-b border-slate-100 border-dashed relative hover:bg-slate-50/50 transition-colors" />
                    ))}
                  </React.Fragment>
                ))}

                {/* CAMADA DE AGENDAMENTOS */}
                <div className={`absolute inset-0 left-[64px] grid ${tipoVisualizacao === 'dia' ? 'grid-cols-1' : 'grid-cols-7'} pointer-events-none`}>
                  {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 pointer-events-auto z-10 backdrop-blur-sm" style={{ gridColumn: '1 / -1' }}>
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                      <p className="text-sm font-semibold text-slate-600">Sincronizando...</p>
                    </div>
                  ) : (
                    Array.from({ length: tipoVisualizacao === 'dia' ? 1 : 7 }).map((_, indexDiaColuna) => {
                      const dataDaColuna = tipoVisualizacao === 'dia' ? dataAtual : diasDaSemana[indexDiaColuna];
                      const diaDaSemanaReal = (dataDaColuna.getDay() + 6) % 7;
                      const chaveData = dataParaChave(dataDaColuna);

                      return (
                        <div key={indexDiaColuna} className="relative h-full px-1">
                          {agendamentos
                            .filter((a) => (a.dataCompleta ? a.dataCompleta === chaveData : a.diaSemana === diaDaSemanaReal))
                            .map((agendamento, idx) => (
                              <div 
                                key={agendamento.id}
                                className={`absolute left-1 right-1 rounded-lg p-2.5 text-slate-900 pointer-events-auto shadow-sm hover:shadow-md hover:z-10 transition-all hover:-translate-y-0.5 cursor-pointer border border-black/5 ${bgColors[idx % bgColors.length]}`}
                                style={obterEstiloCard(agendamento.horaInicio, agendamento.horaFim)}
                              >
                                <p className="text-xs font-extrabold leading-tight truncate">{agendamento.servico}</p>
                                <p className="text-[11px] font-bold opacity-90 truncate">{agendamento.clienteNome}</p>
                                <p className="text-[10px] font-semibold mt-0.5 opacity-80 bg-black/10 inline-block px-1.5 py-0.5 rounded-md">
                                  {agendamento.horaInicio} - {agendamento.horaFim}
                                </p>
                              </div>
                            ))}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL DE ADICIONAR AGENDAMENTO ================= */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Novo Agendamento</h2>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={salvarNovoAgendamento} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Título / Serviço</label>
                <input type="text" value={novoTitulo} onChange={(e) => setNovoTitulo(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Ex: Manutenção de encanamento" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Data</label>
                <input type="date" value={novaData} onChange={(e) => setNovaData(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-700" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Horário Início</label>
                  <input type="time" value={novaHoraInicio} onChange={(e) => setNovaHoraInicio(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-700" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Horário Fim</label>
                  <input type="time" value={novaHoraFim} onChange={(e) => setNovaHoraFim(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-700" />
                </div>
              </div>
              <button type="button" onClick={() => setModalAberto(false)} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-blue-200">
                Salvar Agendamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}