-- Módulo 2: Entrevista Inteligente Assistida por IA

CREATE TABLE entrevistas (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id  UUID        NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
    status      VARCHAR(20) NOT NULL DEFAULT 'EM_ANDAMENTO',
    versao      INTEGER     NOT NULL DEFAULT 0,
    criado_em   TIMESTAMP   NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    criado_por  VARCHAR(50),
    atualizado_por VARCHAR(50)
);

CREATE INDEX idx_entrevistas_demanda ON entrevistas(demanda_id);

-- ------------------------------------------------------------------

CREATE TABLE mensagens_entrevista (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entrevista_id   UUID        NOT NULL REFERENCES entrevistas(id) ON DELETE CASCADE,
    role            VARCHAR(10) NOT NULL,
    conteudo        TEXT        NOT NULL,
    versao          INTEGER     NOT NULL DEFAULT 0,
    criado_em       TIMESTAMP   NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMP   NOT NULL DEFAULT NOW(),
    criado_por      VARCHAR(50),
    atualizado_por  VARCHAR(50)
);

CREATE INDEX idx_mensagens_entrevista ON mensagens_entrevista(entrevista_id, criado_em ASC);

-- ------------------------------------------------------------------

CREATE TABLE sumarios_levantamento (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entrevista_id           UUID UNIQUE NOT NULL REFERENCES entrevistas(id) ON DELETE CASCADE,
    contexto                TEXT,
    usuarios_identificados  TEXT,
    processo_atual          TEXT,
    necessidades            TEXT,
    regras_negocio          TEXT,
    integracoes             TEXT,
    restricoes_premissas    TEXT,
    informacoes_ausentes    TEXT,
    conteudo_completo       TEXT NOT NULL,
    versao                  INTEGER   NOT NULL DEFAULT 0,
    criado_em               TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em           TIMESTAMP NOT NULL DEFAULT NOW(),
    criado_por              VARCHAR(50),
    atualizado_por          VARCHAR(50)
);
