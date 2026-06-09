export class Agenda {
    id_agenda?: number;
    id_prestador: number;
    id_solicitacao?: number;
    horario_inicio: Date;
    horario_fim: Date;
    status: string;
    titulo: string;
    descricao?: string;

    constructor(dados: {
        id_prestador: number;
        id_solicitacao?: number;
        horario_inicio: Date;
        horario_fim: Date;
        status?: string;
        titulo: string;
        descricao?: string;
    }) {
        this.id_prestador   = dados.id_prestador;
        this.id_solicitacao = dados.id_solicitacao;
        this.horario_inicio = dados.horario_inicio;
        this.horario_fim    = dados.horario_fim;
        this.status         = dados.status ?? "Disponível";
        this.titulo         = dados.titulo;
        this.descricao      = dados.descricao;
    }

    static getCreateTableSQL(): string {
        return `
            CREATE TABLE IF NOT EXISTS agenda (
                id_agenda       INT AUTO_INCREMENT PRIMARY KEY,
                id_prestador    INT NOT NULL,
                id_solicitacao  INT NULL,
                horario_inicio  DATETIME NOT NULL,
                horario_fim     DATETIME NOT NULL,
                status          VARCHAR(50) NOT NULL,
                titulo          VARCHAR(100) NOT NULL,
                descricao       TEXT,

                CONSTRAINT fk_agenda_prestador
                    FOREIGN KEY (id_prestador)
                    REFERENCES prestador(id_usuario)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE,

                CONSTRAINT fk_agenda_solicitacao
                    FOREIGN KEY (id_solicitacao)
                    REFERENCES solicitacaoservico(id_solicitacao)
                    ON DELETE SET NULL
                    ON UPDATE CASCADE
            );
        `;
    }
}