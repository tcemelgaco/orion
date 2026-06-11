-- Módulo 1: Gestão de Demandas e Projetos

CREATE TABLE demandas (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo               VARCHAR(255) NOT NULL,
    descricao            TEXT,
    area_demandante      VARCHAR(100) NOT NULL,
    status               VARCHAR(30)  NOT NULL DEFAULT 'RASCUNHO',
    prioridade           VARCHAR(10)  NOT NULL DEFAULT 'MEDIA',
    tipo                 VARCHAR(30)  NOT NULL,
    prazo_estimado       DATE,
    matricula_solicitante VARCHAR(20) NOT NULL,
    nome_solicitante     VARCHAR(100),
    premissas            TEXT,
    restricoes           TEXT,
    observacoes          TEXT,
    versao               INTEGER      NOT NULL DEFAULT 0,
    criado_em            TIMESTAMP    NOT NULL DEFAULT NOW(),
    atualizado_em        TIMESTAMP    NOT NULL DEFAULT NOW(),
    criado_por           VARCHAR(50),
    atualizado_por       VARCHAR(50)
);

CREATE INDEX idx_demandas_status       ON demandas(status);
CREATE INDEX idx_demandas_area         ON demandas(area_demandante);
CREATE INDEX idx_demandas_criado_em    ON demandas(criado_em DESC);
CREATE INDEX idx_demandas_solicitante  ON demandas(matricula_solicitante);

-- ------------------------------------------------------------------

CREATE TABLE stakeholders (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id  UUID         NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
    nome        VARCHAR(100) NOT NULL,
    matricula   VARCHAR(20),
    area        VARCHAR(100),
    papel       VARCHAR(30)  NOT NULL,
    contato     VARCHAR(100),
    versao      INTEGER      NOT NULL DEFAULT 0,
    criado_em   TIMESTAMP    NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP  NOT NULL DEFAULT NOW(),
    criado_por  VARCHAR(50),
    atualizado_por VARCHAR(50)
);

CREATE INDEX idx_stakeholders_demanda ON stakeholders(demanda_id);

-- ------------------------------------------------------------------

CREATE TABLE historico_demandas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id          UUID         NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
    acao                VARCHAR(50)  NOT NULL,
    descricao_alteracao TEXT,
    status_anterior     VARCHAR(30),
    status_novo         VARCHAR(30),
    alterado_por        VARCHAR(50)  NOT NULL,
    alterado_em         TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_historico_demanda_em ON historico_demandas(demanda_id, alterado_em DESC);
