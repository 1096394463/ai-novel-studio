package com.ainovelstudio.novelstudio;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class NovelStudioApplication {

    private static final Logger log = LoggerFactory.getLogger(NovelStudioApplication.class);

    public static void main(String[] args) {
        log.info("=== AI Novel Studio Backend Starting ===");
        log.info("Java version: {}", System.getProperty("java.version"));
        log.info("Java home: {}", System.getProperty("java.home"));
        log.info("OS: {} {} {}", System.getProperty("os.name"), System.getProperty("os.arch"), System.getProperty("os.version"));
        log.info("Working dir: {}", System.getProperty("user.dir"));
        log.info("Arguments: {}", String.join(" ", args));
        SpringApplication.run(NovelStudioApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady(ApplicationReadyEvent event) {
        log.info("=== AI Novel Studio Backend Ready ===");
        log.info("Active profiles: {}", String.join(", ", event.getApplicationContext().getEnvironment().getActiveProfiles()));
        log.info("Server port: {}", event.getApplicationContext().getEnvironment().getProperty("server.port"));
        log.info("Database: {}", event.getApplicationContext().getEnvironment().getProperty("spring.datasource.url"));
    }
}
