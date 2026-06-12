-- Indicador de suficiência da entrevista
ALTER TABLE sumarios_levantamento
    ADD COLUMN suficiencia          INTEGER,
    ADD COLUMN avaliacao_suficiencia TEXT;

-- Checklist de cobertura dos requisitos
ALTER TABLE requisitos
    ADD COLUMN checklist_cobertura TEXT;

-- Flag de duplicata (aponta para o id do requisito similar)
ALTER TABLE requisitos
    ADD COLUMN duplicata_de UUID;
