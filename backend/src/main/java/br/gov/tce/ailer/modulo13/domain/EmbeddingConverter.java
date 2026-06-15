package br.gov.tce.ailer.modulo13.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converte float[] ↔ String no formato "[0.1,0.2,...]" que o PostgreSQL
 * aceita como literal para o tipo vector do pgvector.
 */
@Converter
public class EmbeddingConverter implements AttributeConverter<float[], String> {

    @Override
    public String convertToDatabaseColumn(float[] attribute) {
        if (attribute == null) return null;
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < attribute.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(attribute[i]);
        }
        return sb.append(']').toString();
    }

    @Override
    public float[] convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return null;
        String cleaned = dbData.replaceAll("[\\[\\]\\s]", "");
        if (cleaned.isEmpty()) return new float[0];
        String[] parts = cleaned.split(",");
        float[] result = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            result[i] = Float.parseFloat(parts[i].trim());
        }
        return result;
    }

    public static String format(float[] vetor) {
        if (vetor == null) return null;
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vetor.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(vetor[i]);
        }
        return sb.append(']').toString();
    }
}
