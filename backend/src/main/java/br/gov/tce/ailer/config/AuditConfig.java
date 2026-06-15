package br.gov.tce.ailer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class AuditConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            // AnonymousAuthenticationToken tem isAuthenticated()=true, mas name="anonymousUser"
            if (auth == null || !auth.isAuthenticated()
                    || "anonymousUser".equals(auth.getName())) {
                return Optional.of("sistema");
            }
            return Optional.of(auth.getName());
        };
    }
}
