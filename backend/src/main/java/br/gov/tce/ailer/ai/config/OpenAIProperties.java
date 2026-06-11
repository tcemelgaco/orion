package br.gov.tce.ailer.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "openai")
public record OpenAIProperties(
        String apiKey,
        String baseUrl,
        String model,
        double temperature,
        int maxTokens
) {}
