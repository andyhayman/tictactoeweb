# Build stage
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY . .
RUN mvn clean package -DskipTests -q

# Runtime stage
FROM eclipse-temurin:17-jdk-slim
WORKDIR /app
COPY --from=builder /build/target/tictactoeweb-0.0.1-SNAPSHOT.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/game/state || exit 1

# Run the application with production profile
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
EXPOSE 8080
