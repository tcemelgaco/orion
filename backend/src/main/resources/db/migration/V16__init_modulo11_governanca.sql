-- Módulo 11: Governança

CREATE TABLE governanca_projeto (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id              UUID        NOT NULL UNIQUE REFERENCES demandas(id) ON DELETE CASCADE,
    matriz_raci             TEXT,
    stakeholders_mapeados   TEXT,
    dependencias_externas   TEXT,
    premissas               TEXT,
    restricoes              TEXT,
    riscos                  TEXT,
    plano_mitigacao         TEXT,
    status_aprovacao        VARCHAR(30) NOT NULL DEFAULT 'RASCUNHO_IA',
    aprovado_por            VARCHAR(120),
    aprovado_em             TIMESTAMP,
    fonte                   VARCHAR(10) NOT NULL DEFAULT 'IA',
    versao                  INTEGER     NOT NULL DEFAULT 0,
    criado_em               TIMESTAMP   NOT NULL DEFAULT NOW(),
    atualizado_em           TIMESTAMP   NOT NULL DEFAULT NOW(),
    criado_por              VARCHAR(50),
    atualizado_por          VARCHAR(50)
);
