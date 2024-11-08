# Etapa de construcción
FROM node:20.10.0 AS build

# Configuración de directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración y dependencias
COPY package.json package-lock.json ./
COPY angular.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos del proyecto y construir la aplicación
COPY . .
RUN npm run build -- --output-path=dist/proyecto --configuration production

# Etapa de despliegue (con Nginx)
FROM nginx:latest

# Copiar el archivo de configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos generados en la etapa de construcción
COPY --from=build /app/dist/proyecto /usr/share/nginx/html

# Exponer el puerto 80 para Nginx
EXPOSE 80

# Comando de arranque para Nginx
CMD ["nginx", "-g", "daemon off;"]