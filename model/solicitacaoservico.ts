export class SolicitacaoServico {
    id_solicitacao?: number;
    id_usuario: number;
    id_prestador: number;
    endereco?: string;
    data_solicitacao?: Date;
    data_agendamento?: Date;
    status: boolean;
    descricao_servico?: string;
    complemento: string;

    constructor(dados: {
        id_usuario: number;
        id_prestador: number;
        endereco?: string;
        data_solicitacao?: Date;
        data_agendamento?: Date;
        status?: boolean;
        descricao_servico?: string;
        complemento: string;
    }) {
        this.id_usuario        = dados.id_usuario;
        this.id_prestador      = dados.id_prestador;
        this.endereco          = dados.endereco;
        this.data_solicitacao  = dados.data_solicitacao ?? new Date();
        this.data_agendamento  = dados.data_agendamento;
        this.status            = dados.status ?? false; // false = pendente
        this.descricao_servico = dados.descricao_servico;
        this.complemento       = dados.complemento;
    }

    static getCreateTableSQL(): string {
        return `
            CREATE TABLE IF NOT EXISTS solicitacaoservico (
                id_solicitacao   INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario       INT NOT NULL,
                id_prestador     INT NOT NULL,
                endereco         VARCHAR(255),
                data_solicitacao DATE,
                data_agendamento DATE,
                status           TINYINT(1) DEFAULT 0,
                descricao_servico TEXT,
                complemento      VARCHAR(255) NOT NULL,

                CONSTRAINT fk_solic_usuario
                    FOREIGN KEY (id_usuario)
                    REFERENCES usuario(id_usuario)
                    ON DELETE CASCADE ON UPDATE CASCADE,

                CONSTRAINT fk_solic_prestador
                    FOREIGN KEY (id_prestador)
                    REFERENCES prestador(id_usuario)
                    ON DELETE CASCADE ON UPDATE CASCADE
            );
        `;
    }
}
