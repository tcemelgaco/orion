package br.gov.tce.ailer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class AilerBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AilerBackendApplication.class, args);
	}

}
