CREATE TABLE agentes_sessoes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id      UUID NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
    tipo_agente     VARCHAR(30) NOT NULL,
    titulo          VARCHAR(200),
    versao          INTEGER NOT NULL DEFAULT 0,
    criado_em       TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMP NOT NULL DEFAULT NOW(),
    criado_por      VARCHAR(120),
    atualizado_por  VARCHAR(120)
);

CREATE TABLE agentes_mensagens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sessao_id   UUID NOT NULL REFERENCES agentes_sessoes(id) ON DELETE CASCADE,
    papel       VARCHAR(10) NOT NULL CHECK (papel IN ('AGENTE','USUARIO')),
    conteudo    TEXT NOT NULL,
    criado_em   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agentes_sessoes_demanda ON agentes_sessoes(demanda_id);
CREATE INDEX idx_agentes_mensagens_sessao ON agentes_mensagens(sessao_id);
