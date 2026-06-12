-- Módulo 5: Histórias de Usuário e Backlog

CREATE TABLE epicos (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id        UUID        NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
    codigo            VARCHAR(12) NOT NULL,
    titulo            VARCHAR(300) NOT NULL,
    descricao         TEXT,
    status            VARCHAR(20) NOT NULL DEFAULT 'ABERTO',
    prioridade        VARCHAR(10) NOT NULL DEFAULT 'MEDIA',
    fonte             VARCHAR(10) NOT NULL DEFAULT 'MANUAL',
    ordem_exibicao    INTEGER     NOT NULL DEFAULT 0,
    versao            INTEGER     NOT NULL DEFAULT 0,
    criado_em         TIMESTAMP   NOT NULL DEFAULT NOW(),
    atualizado_em     TIMESTAMP   NOT NULL DEFAULT NOW(),
    criado_por        VARCHAR(100),
    atualizado_por    VARCHAR(100)
);

CREATE TABLE features (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    epico_id          UUID        NOT NULL REFERENCES epicos(id) ON DELETE CASCADE,
    demanda_id        UUID        NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
    codigo            VARCHAR(12) NOT NULL,
    titulo            VARCHAR(300) NOT NULL,
    descricao         TEXT,
    status            VARCHAR(20) NOT NULL DEFAULT 'ABERTO',
    prioridade        VARCHAR(10) NOT NULL DEFAULT 'MEDIA',
    fonte             VARCHAR(10) NOT NULL DEFAULT 'MANUAL',
    ordem_exibicao    INTEGER     NOT NULL DEFAULT 0,
    versao            INTEGER     NOT NULL DEFAULT 0,
    criado_em         TIMESTAMP   NOT NULL DEFAULT NOW(),
    atualizado_em     TIMESTAMP   NOT NULL DEFAULT NOW(),
    criado_por        VARCHAR(100),
    atualizado_por    VARCHAR(100)
);

CREATE TABLE historias_usuario (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id          UUID        NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    demanda_id          UUID        NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
    codigo              VARCHAR(12) NOT NULL,
    como_papel          VARCHAR(200) NOT NULL,
    quero_acao          VARCHAR(500) NOT NULL,
    para_beneficio      VARCHAR(500),
    criterios_aceitacao TEXT,
    story_points        INTEGER,
    prioridade          VARCHAR(10) NOT NULL DEFAULT 'MEDIA',
    status              VARCHAR(20) NOT NULL DEFAULT 'BACKLOG',
    fonte               VARCHAR(10) NOT NULL DEFAULT 'MANUAL',
    ordem_exibicao      INTEGER     NOT NULL DEFAULT 0,
    versao              INTEGER     NOT NULL DEFAULT 0,
    criado_em           TIMESTAMP   NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMP   NOT NULL DEFAULT NOW(),
    criado_por          VARCHAR(100),
    atualizado_por      VARCHAR(100)
);

CREATE INDEX idx_epicos_demanda_id ON epicos(demanda_id);
CREATE INDEX idx_features_epico_id ON features(epico_id);
CREATE INDEX idx_features_demanda_id ON features(demanda_id);
CREATE INDEX idx_historias_feature_id ON historias_usuario(feature_id);
CREATE INDEX idx_historias_demanda_id ON historias_usuario(demanda_id);
