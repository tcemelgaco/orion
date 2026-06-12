-- Módulo 8: Prototipação Assistida

CREATE TABLE prototipos_sistema (
    id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id               UUID        NOT NULL UNIQUE REFERENCES demandas(id) ON DELETE CASCADE,
    descricao_geral          TEXT,
    telas                    TEXT,
    fluxo_navegacao          TEXT,
    componentes_principais   TEXT,
    paleta                   TEXT,
    diretrizes               TEXT,
    notas_acessibilidade     TEXT,
    tecnologias_sugeridas    TEXT,
    status_aprovacao         VARCHAR(30) NOT NULL DEFAULT 'RASCUNHO_IA',
    aprovado_por             VARCHAR(120),
    aprovado_em              TIMESTAMP,
    fonte                    VARCHAR(10) NOT NULL DEFAULT 'IA',
    versao                   INTEGER     NOT NULL DEFAULT 0,
    criado_em                TIMESTAMP   NOT NULL DEFAULT NOW(),
    atualizado_em            TIMESTAMP   NOT NULL DEFAULT NOW(),
    criado_por               VARCHAR(50),
    atualizado_por           VARCHAR(50)
);
