package com.panelforge.panel_forge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class PanelForgeApplication {

	public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .directory("./") 
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();

        // Load the environment variables into System properties for Spring to read
        dotenv.entries().forEach(entry -> 
            System.setProperty(entry.getKey(), entry.getValue())
        );

		SpringApplication.run(PanelForgeApplication.class, args);
		System.out.println("Spring Boot application started!");
	}

}
