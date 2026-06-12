-- Módulo 4: Especificação de Requisitos

CREATE TABLE requisitos (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id          UUID        NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
    tipo                VARCHAR(5)  NOT NULL,            -- RF, RNF, RN, RI, RS
    codigo              VARCHAR(12) NOT NULL,
    titulo              VARCHAR(300) NOT NULL,
    descricao           TEXT,
    prioridade          VARCHAR(10) NOT NULL DEFAULT 'MEDIA',
    status              VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO',
    fonte               VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    criterio_aceitacao  TEXT,
    observacoes         TEXT,
    ordem_exibicao      INTEGER     NOT NULL DEFAULT 0,
    versao              INTEGER     NOT NULL DEFAULT 0,
    criado_em           TIMESTAMP   NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMP   NOT NULL DEFAULT NOW(),
    criado_por          VARCHAR(50),
    atualizado_por      VARCHAR(50)
);

CREATE INDEX idx_requisitos_demanda ON requisitos(demanda_id);
CREATE INDEX idx_requisitos_tipo    ON requisitos(demanda_id, tipo);
