# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY helpdesk-backend/pom.xml .
COPY helpdesk-backend/src ./src
RUN mvn clean package -Dmaven.test.skip=true

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/helpdesk-backend-0.0.1-SNAPSHOT.jar app.jar
ENV JAVA_OPTS="-Xmx400m -Xms256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
EXPOSE 8085
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
