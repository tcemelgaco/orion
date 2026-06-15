-- Adiciona colunas de auditoria do BaseEntity que estavam faltando na gitlab_config
ALTER TABLE gitlab_config
    ADD COLUMN IF NOT EXISTS versao INTEGER NOT NULL DEFAULT 0;
