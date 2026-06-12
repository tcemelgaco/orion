-- Ciclo de Aprovação: RASCUNHO_IA → EM_REVISAO → APROVADO → PUBLICADO

-- Canvas: adiciona colunas de aprovação
ALTER TABLE canvas_projeto
    ADD COLUMN status_aprovacao VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO_IA',
    ADD COLUMN aprovado_por     VARCHAR(150),
    ADD COLUMN aprovado_em      TIMESTAMP WITH TIME ZONE;

-- Requisitos: expande coluna de status e adiciona rastreio de aprovação
ALTER TABLE requisitos
    ALTER COLUMN status TYPE VARCHAR(20),
    ADD COLUMN aprovado_por VARCHAR(150),
    ADD COLUMN aprovado_em  TIMESTAMP WITH TIME ZONE;

-- Atualiza registros existentes gerados por IA para RASCUNHO_IA
UPDATE requisitos SET status = 'RASCUNHO_IA' WHERE fonte = 'IA' AND status = 'RASCUNHO';

-- Épicos: adiciona colunas de aprovação (representa aprovação do bloco de backlog)
ALTER TABLE epicos
    ADD COLUMN status_aprovacao VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO_IA',
    ADD COLUMN aprovado_por     VARCHAR(150),
    ADD COLUMN aprovado_em      TIMESTAMP WITH TIME ZONE;
