-- Integração GitLab: configuração por demanda e rastreamento de itens exportados

CREATE TABLE gitlab_config (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id      UUID        NOT NULL UNIQUE REFERENCES demandas(id) ON DELETE CASCADE,
    gitlab_url      VARCHAR(500) NOT NULL,
    project_id      VARCHAR(200) NOT NULL,
    access_token    VARCHAR(500) NOT NULL,
    ativo           BOOLEAN     NOT NULL DEFAULT true,
    criado_em       TIMESTAMP   NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMP   NOT NULL DEFAULT NOW(),
    criado_por      VARCHAR(120),
    atualizado_por  VARCHAR(120)
);

CREATE INDEX idx_gitlab_config_demanda ON gitlab_config(demanda_id);

-- Rastreamento de Épicos exportados como Milestones
ALTER TABLE epicos
    ADD COLUMN IF NOT EXISTS gitlab_milestone_id  INTEGER,
    ADD COLUMN IF NOT EXISTS gitlab_milestone_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS gitlab_exportado_em  TIMESTAMP;

-- Rastreamento de Histórias exportadas como Issues
ALTER TABLE historias_usuario
    ADD COLUMN IF NOT EXISTS gitlab_issue_iid     INTEGER,
    ADD COLUMN IF NOT EXISTS gitlab_issue_url     VARCHAR(500),
    ADD COLUMN IF NOT EXISTS gitlab_exportado_em  TIMESTAMP;
