-- Repositório de Artefatos: documentos de referência vinculados a uma demanda
-- Tipos: leis, instruções normativas, resoluções, contratos, manuais, especificações, outros

CREATE TABLE artefatos (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id     UUID         NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
    nome           VARCHAR(255) NOT NULL,
    nome_original  VARCHAR(500) NOT NULL,
    descricao      TEXT,
    tipo_artefato  VARCHAR(30)  NOT NULL DEFAULT 'OUTRO',
    tamanho_bytes  BIGINT       NOT NULL DEFAULT 0,
    content_type   VARCHAR(120) NOT NULL DEFAULT 'application/octet-stream',
    conteudo       BYTEA        NOT NULL,
    uploadado_por  VARCHAR(150),
    criado_em      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_artefatos_demanda ON artefatos(demanda_id);
CREATE INDEX idx_artefatos_tipo    ON artefatos(tipo_artefato);
