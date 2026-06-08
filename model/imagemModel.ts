export class Imagem{
    id_imagem?: number;
    id_servico?: number;  //FK
    url?: string;

    constructor(data: { 
        id_servico: number; 
        url: string; 
        id_imagem?: number;
    }) {
        this.id_imagem = data.id_imagem;
        this.id_servico = data.id_servico;
        this.url = data.url;
    }

    static createTableQuery(): string {
        return `
            CREATE TABLE IF NOT EXISTS imagem (
                id_imagem INT AUTO_INCREMENT PRIMARY KEY,
                id_servico INT NOT NULL,
                url VARCHAR(500) NOT NULL
            )
        `;
    }
}
