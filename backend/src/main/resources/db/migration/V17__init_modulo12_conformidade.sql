-- Módulo 12: Conformidade e Qualidade

CREATE TABLE conformidade_qualidade (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id              UUID        NOT NULL UNIQUE REFERENCES demandas(id) ON DELETE CASCADE,
    analise_lgpd            TEXT,
    analise_seguranca       TEXT,
    analise_acessibilidade  TEXT,
    qualidade_requisitos    TEXT,
    pendencias              TEXT,
    score_geral             INTEGER,
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
