-- Fase 3: Base de Conhecimento Institucional (M13)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS conhecimento_documentos (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo            VARCHAR(500) NOT NULL,
    conteudo          TEXT        NOT NULL,
    tipo              VARCHAR(50) NOT NULL DEFAULT 'DOCUMENTO',
    tags              TEXT,
    fonte             VARCHAR(300),
    embedding         TEXT,
    tokens_estimados  INTEGER,
    versao            INTEGER     NOT NULL DEFAULT 0,
    criado_em         TIMESTAMP   NOT NULL DEFAULT NOW(),
    atualizado_em     TIMESTAMP   NOT NULL DEFAULT NOW(),
    criado_por        VARCHAR(120),
    atualizado_por    VARCHAR(120)
);
