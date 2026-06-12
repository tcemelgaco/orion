-- Módulo 10: Estimativas

CREATE TABLE estimativas_projeto (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id          UUID        NOT NULL UNIQUE REFERENCES demandas(id) ON DELETE CASCADE,
    story_points_total  INTEGER,
    horas_analista      NUMERIC(8,1),
    horas_dev           NUMERIC(8,1),
    horas_qa            NUMERIC(8,1),
    horas_ux            NUMERIC(8,1),
    prazo_sprints       INTEGER,
    recursos_sugeridos  TEXT,
    matriz_esforco      TEXT,
    resumo_executivo    TEXT,
    status_aprovacao    VARCHAR(30) NOT NULL DEFAULT 'RASCUNHO_IA',
    aprovado_por        VARCHAR(120),
    aprovado_em         TIMESTAMP,
    fonte               VARCHAR(10) NOT NULL DEFAULT 'IA',
    versao              INTEGER     NOT NULL DEFAULT 0,
    criado_em           TIMESTAMP   NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMP   NOT NULL DEFAULT NOW(),
    criado_por          VARCHAR(50),
    atualizado_por      VARCHAR(50)
);
