FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -q
COPY src ./src
RUN ./mvnw package -DskipTests -q

FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
RUN addgroup -S ailer && adduser -S ailer -G ailer
COPY --from=build /app/target/*.jar app.jar
USER ailer
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
