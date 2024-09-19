# Usa una imagen de Maven para compilar el proyecto
FROM maven:3-openjdk-17 AS build

# Copia todo el contenido del directorio actual al directorio de trabajo en la imagen
COPY . /app

# Establece el directorio de trabajo
WORKDIR /app

# Compila el proyecto
RUN mvn clean package

# Fase de ejecución: Usa una imagen de Java para ejecutar la aplicación
FROM adoptopenjdk:latest

# Establece el directorio de trabajo
WORKDIR /app

# Copia el archivo JAR compilado desde la fase de compilación
COPY --from=build /app/target/ActividadPaginacion-0.0.1-SNAPSHOT.jar app.jar

# Expone el puerto que utiliza tu aplicación
EXPOSE 9999

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]