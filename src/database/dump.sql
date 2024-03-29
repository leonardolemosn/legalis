DUMP.SQL - Legalis

-- Extensão para gerar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Perfis
CREATE TABLE Profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Profile_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Tabela de Tipos de Grupo
CREATE TABLE group_types (
    group_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Tabela de Escritórios
CREATE TABLE offices (
    office_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    parent_office_id UUID NULL REFERENCES offices(office_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Tabela de Grupos
CREATE TABLE groups (
    group_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    group_type_id UUID NOT NULL REFERENCES group_types(group_type_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Tabela de Tipos de Usuário
CREATE TABLE users_types (
    user_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profiles_id UUID NOT NULL REFERENCES Profiles(id),
    type_name VARCHAR(255) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Tabela de Usuários
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_type_id UUID NOT NULL REFERENCES users_types(user_type_id),
    office_id UUID NULL REFERENCES offices(office_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Tabela de Tipos de Documento
CREATE TABLE document_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_type_id UUID NOT NULL REFERENCES Profiles(id),
    document_type VARCHAR(255) UNIQUE NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Tabela de Documentos dos Usuários
CREATE TABLE users_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    document_type_id UUID NOT NULL REFERENCES document_types(id),
    document_number VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Tabela de Associação Usuário-Escritório
CREATE TABLE user_office (
    user_id UUID NOT NULL,
    office_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
    PRIMARY KEY (user_id, office_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (office_id) REFERENCES offices(office_id)
);

-- Tabela de Associação Usuário-Grupo
CREATE TABLE user_group (
    user_id UUID NOT NULL,
    group_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (group_id) REFERENCES groups(group_id)
);

-- Tabela de Associação Escritório-Grupo
CREATE TABLE office_group (
    office_id UUID NOT NULL,
    group_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
    PRIMARY KEY (office_id, group_id),
    FOREIGN KEY (office_id) REFERENCES offices(office_id),
    FOREIGN KEY (group_id) REFERENCES groups(group_id)
);

