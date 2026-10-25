# ==============================================================================
# MediBook Backend - Multi-Stage Production Dockerfile
# ==============================================================================

# Stage 1: Build JAR using Eclipse Temurin JDK 17
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /workspace

# Copy Maven wrapper & POM to leverage layer caching
COPY pom.xml mvnw ./
COPY .mvn .mvn

RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build production jar
COPY src src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Minimal runtime image
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Run as non-root user for security
RUN addgroup -S medibook && adduser -S medibook -G medibook
USER medibook

COPY --from=builder /workspace/target/*.jar app.jar

EXPOSE 8080

# Tune memory allocation for containerized environments
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
