-- Módulo 3: Canvas do Projeto

CREATE TABLE canvas_projeto (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id              UUID        NOT NULL UNIQUE REFERENCES demandas(id) ON DELETE CASCADE,
    contexto                TEXT,
    problema                TEXT,
    solucao_proposta        TEXT,
    usuarios                TEXT,
    funcionalidades_chave   TEXT,
    restricoes              TEXT,
    premissas               TEXT,
    riscos                  TEXT,
    criterios_sucesso       TEXT,
    integracoes             TEXT,
    gerado_por_ia           BOOLEAN     NOT NULL DEFAULT TRUE,
    versao                  INTEGER     NOT NULL DEFAULT 0,
    criado_em               TIMESTAMP   NOT NULL DEFAULT NOW(),
    atualizado_em           TIMESTAMP   NOT NULL DEFAULT NOW(),
    criado_por              VARCHAR(50),
    atualizado_por          VARCHAR(50)
);

CREATE INDEX idx_canvas_demanda ON canvas_projeto(demanda_id);
