import InicialPrestador from "@/view/inicialPrestador";
import { AgendaController } from "@/controller/agendaController";

// Tipagem para eliminar o erro implícito de any[]
interface BancoAgendaRow {
  id_agenda: number;
  horario_inicio: string | Date;
  titulo: string | null;
  endereco: string | null;
  status: string | null;
  [key: string]: any;
}

export default async function Page() {
  let dadosFormatados: any[] = [];

  try {
    const idPrestadorLogado = 1; // ID estático do Carlos temporário
    
    // Busca direto do banco de dados no lado do servidor
    const agendaHojeRaw = (await AgendaController.listarPorPrestador(idPrestadorLogado)) as BancoAgendaRow[];

    // Formata os dados limpando campos opcionais
    dadosFormatados = agendaHojeRaw.map((item) => {
      const dataInicio = new Date(item.horario_inicio);
      const horaFormatada = dataInicio.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const statusCru = item.status || "pendente";
      const statusFormatado = statusCru.charAt(0).toUpperCase() + statusCru.slice(1);

      return {
        id: item.id_agenda.toString(),
        hora: horaFormatada,
        evento: item.titulo || "Serviço",
        local: item.endereco || "Local não informado", // Buscando o inner join do seu Service
        status: statusFormatado,
      };
    });
  } catch (error) {
    console.error("Erro ao pré-carregar dados na Page:", error);
  }

  // Renderiza a view passando a propriedade direto
  return <InicialPrestador agendaHoje={dadosFormatados} />;
}