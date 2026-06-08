CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    telefone VARCHAR(20),
    cidade VARCHAR(100),
    foto_perfil VARCHAR(255),
    status_conta VARCHAR(50) DEFAULT 'ativo',
    is_admin BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE prestador (
    id_usuario INT NOT NULL,
    descricao_profissional TEXT,
    status_verificado BOOLEAN DEFAULT FALSE,
    status_social VARCHAR(50) DEFAULT 'ativo',
    impulsiona_perfil BOOLEAN DEFAULT FALSE,
    categoria_principal VARCHAR(100),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id_usuario), 
    CONSTRAINT fk_prestador_usuario 
        FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id_usuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);