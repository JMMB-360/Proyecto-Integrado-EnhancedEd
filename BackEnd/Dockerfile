# Usa una imagen de Maven para compilar el proyecto
FROM maven:3-openjdk-17 AS build

# Establece el directorio de trabajo
WORKDIR /app

# Copia todo el contenido del directorio actual al directorio de trabajo en la imagen
# COPY . /app

# Copiar los archivos de Maven
COPY pom.xml .
COPY src ./src

# Compila el proyecto (Junto a las dependencias)
RUN mvn clean package -DskipTests

# Fase de ejecución: Usa una imagen de Java para ejecutar la aplicación
# FROM adoptopenjdk:latest
FROM openjdk:17-jdk-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia el archivo JAR compilado desde la fase de compilación
COPY --from=build /app/target/backend-1.2.jar app.jar

# Expone el puerto que utiliza tu aplicación
EXPOSE 9999

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]