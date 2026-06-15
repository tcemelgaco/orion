-- Índice HNSW funcional para busca semântica por cosine similarity (Módulo 13)
-- Usa expressão de cast TEXT → vector(1536) sem alterar o tipo da coluna.
-- m=16, ef_construction=64 são parâmetros adequados para até ~1M documentos.
CREATE INDEX IF NOT EXISTS idx_conhecimento_embedding_hnsw
    ON conhecimento_documentos
    USING hnsw ((embedding::vector(1536)) vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
