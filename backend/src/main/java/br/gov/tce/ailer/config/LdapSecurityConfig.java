package br.gov.tce.ailer.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.ldap.authentication.ad.ActiveDirectoryLdapAuthenticationProvider;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuração de segurança para produção com autenticação via Active Directory (LDAP).
 *
 * Variáveis de ambiente obrigatórias:
 *   AD_DOMAIN   — domínio AD, ex.: tce.ce.gov.br
 *   AD_URL      — URL do controlador de domínio, ex.: ldap://dc.tce.ce.gov.br:389
 *   CORS_ORIGINS — origens permitidas separadas por vírgula
 */
@Configuration
@EnableWebSecurity
@Profile("prod")
public class LdapSecurityConfig {

    @Value("${ad.domain}")
    private String adDomain;

    @Value("${ad.url}")
    private String adUrl;

    @Value("${cors.allowed-origins:https://ailer.tce.ce.gov.br}")
    private String corsOrigins;

    private static final String[] PUBLIC_PATHS = {
            "/actuator/health", "/actuator/info", "/error"
    };

    @Bean
    public SecurityFilterChain prodFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(prodCorsSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .authenticationProvider(adAuthProvider())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_PATHS).permitAll()
                        .anyRequest().authenticated()
                )
                .httpBasic(basic -> {});
        return http.build();
    }

    @Bean
    public ActiveDirectoryLdapAuthenticationProvider adAuthProvider() {
        ActiveDirectoryLdapAuthenticationProvider provider =
                new ActiveDirectoryLdapAuthenticationProvider(adDomain, adUrl);
        // Mapeia grupos AD para roles Spring Security prefixando ROLE_
        provider.setConvertSubErrorCodesToExceptions(true);
        provider.setUseAuthenticationRequestCredentials(true);
        return provider;
    }

    @Bean
    public CorsConfigurationSource prodCorsSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of(corsOrigins.split(",")));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", cfg);
        return source;
    }
}
