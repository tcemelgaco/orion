-- Módulo 7: Modelagem de Processos

CREATE TABLE modelagens_processo (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id          UUID        NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
    tipo_fluxo          VARCHAR(10) NOT NULL,
    titulo              VARCHAR(255) NOT NULL,
    descricao_texto     TEXT,
    codigo_mermaid      TEXT,
    bpmn_textual        TEXT,
    pontos_decisao      TEXT,
    integracoes         TEXT,
    pontos_controle     TEXT,
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

CREATE INDEX idx_modelagens_demanda_id ON modelagens_processo(demanda_id);
