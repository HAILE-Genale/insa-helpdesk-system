package com.insa.helpdesk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class HelpdeskApplication {

    public static void main(String[] args) {
        SpringApplication.run(HelpdeskApplication.class, args);
    }

    @Bean
    public CommandLineRunner dropRoleColumn(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE users DROP COLUMN role;");
                System.out.println("DROPPED ROLE COLUMN FROM USERS TABLE");
            } catch (Exception e) {
                System.out.println("ROLE COLUMN ALREADY DROPPED OR DOES NOT EXIST");
            }
        };
    }
}
