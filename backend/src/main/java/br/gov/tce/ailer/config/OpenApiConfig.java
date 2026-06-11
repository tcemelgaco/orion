package br.gov.tce.ailer.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ailerOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AILER API")
                        .description("Plataforma Corporativa de Engenharia de Requisitos Assistida por IA — TCE-CE")
                        .version("v0.1.0")
                        .contact(new Contact()
                                .name("D2S2 / STI — TCE-CE")
                                .email("sti@tce.ce.gov.br")))
                .addSecurityItem(new SecurityRequirement().addList("basicAuth"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("basicAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("basic")));
    }
}
