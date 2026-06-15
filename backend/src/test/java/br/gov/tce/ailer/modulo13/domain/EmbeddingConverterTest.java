package br.gov.tce.ailer.modulo13.domain;

import org.assertj.core.data.Offset;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("EmbeddingConverter")
class EmbeddingConverterTest {

    private final EmbeddingConverter converter = new EmbeddingConverter();

    @Test
    @DisplayName("deve serializar float[] para string no formato pgvector [v1,v2,...]")
    void deve_serializar_vetor_para_string() {
        float[] vetor = {0.1f, 0.2f, 0.3f};
        assertThat(converter.convertToDatabaseColumn(vetor)).isEqualTo("[0.1,0.2,0.3]");
    }

    @Test
    @DisplayName("deve retornar null ao serializar null")
    void deve_retornar_null_ao_serializar_null() {
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
    }

    @Test
    @DisplayName("deve deserializar string pgvector para float[]")
    void deve_deserializar_string_para_vetor() {
        float[] result = converter.convertToEntityAttribute("[0.1,0.2,0.3]");

        assertThat(result).hasSize(3);
        assertThat(result[0]).isCloseTo(0.1f, Offset.offset(1e-6f));
        assertThat(result[1]).isCloseTo(0.2f, Offset.offset(1e-6f));
        assertThat(result[2]).isCloseTo(0.3f, Offset.offset(1e-6f));
    }

    @Test
    @DisplayName("deve retornar null ao deserializar null")
    void deve_retornar_null_ao_deserializar_null() {
        assertThat(converter.convertToEntityAttribute(null)).isNull();
    }

    @Test
    @DisplayName("deve retornar null ao deserializar string vazia")
    void deve_retornar_null_ao_deserializar_string_vazia() {
        assertThat(converter.convertToEntityAttribute("")).isNull();
    }

    @Test
    @DisplayName("round-trip: serializar → deserializar preserva os valores")
    void deve_realizar_roundtrip_sem_perda() {
        float[] original = {0.123456f, -0.987654f, 0.5f, 1.0f, -1.0f};

        String serializado = converter.convertToDatabaseColumn(original);
        float[] recuperado = converter.convertToEntityAttribute(serializado);

        assertThat(recuperado).hasSize(original.length);
        for (int i = 0; i < original.length; i++) {
            assertThat(recuperado[i]).isCloseTo(original[i], Offset.offset(1e-5f));
        }
    }

    @Test
    @DisplayName("format() estático produz resultado idêntico ao converter")
    void format_estatico_deve_ser_identico_ao_converter() {
        float[] vetor = {1.0f, 2.0f, 3.0f};
        assertThat(EmbeddingConverter.format(vetor)).isEqualTo(converter.convertToDatabaseColumn(vetor));
    }

    @Test
    @DisplayName("format() retorna null para vetor null")
    void format_retorna_null_para_vetor_null() {
        assertThat(EmbeddingConverter.format(null)).isNull();
    }
}
