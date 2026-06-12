-- Score SMART para requisitos
ALTER TABLE requisitos
    ADD COLUMN smart_score    INTEGER,
    ADD COLUMN smart_detalhes TEXT;

-- Score INVEST para histórias de usuário
ALTER TABLE historias_usuario
    ADD COLUMN invest_score    INTEGER,
    ADD COLUMN invest_detalhes TEXT;
