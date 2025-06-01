# Use a lightweight Java 17 image
FROM eclipse-temurin:17-jdk-alpine

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Make Gradle wrapper executable
RUN chmod +x ./gradlew

# Build the project
RUN ./gradlew build --no-daemon

# Expose the port Spring Boot will run on
EXPOSE 8080

# Start the application
CMD ["java", "-jar", "build/libs/trade-journal-0.0.1-SNAPSHOT.jar"]