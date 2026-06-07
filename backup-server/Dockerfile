FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/backup-server-0.1.0.jar app.jar
EXPOSE 8443
ENTRYPOINT ["java", "-jar", "app.jar"]
