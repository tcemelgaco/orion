-- Módulo 6: Casos de Uso

CREATE TABLE casos_de_uso (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id              UUID        NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
    codigo                  VARCHAR(20) NOT NULL,
    nome                    VARCHAR(255) NOT NULL,
    descricao               TEXT,
    atores                  TEXT,
    pre_condicoes           TEXT,
    pos_condicoes           TEXT,
    fluxo_principal         TEXT,
    fluxos_alternativos     TEXT,
    fluxos_excecao          TEXT,
    requisitos_origem       TEXT,
    diagrama_mermaid        TEXT,
    status_aprovacao        VARCHAR(30) NOT NULL DEFAULT 'RASCUNHO_IA',
    aprovado_por            VARCHAR(120),
    aprovado_em             TIMESTAMP,
    fonte                   VARCHAR(10) NOT NULL DEFAULT 'IA',
    ordem_exibicao          INTEGER     NOT NULL DEFAULT 0,
    versao                  INTEGER     NOT NULL DEFAULT 0,
    criado_em               TIMESTAMP   NOT NULL DEFAULT NOW(),
    atualizado_em           TIMESTAMP   NOT NULL DEFAULT NOW(),
    criado_por              VARCHAR(50),
    atualizado_por          VARCHAR(50)
);

CREATE INDEX idx_casos_de_uso_demanda_id ON casos_de_uso(demanda_id);
