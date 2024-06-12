# Usa una imagen de Node.js para construir la aplicación Angular
FROM node:20.10.0 as build

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Compila la aplicación Angular
RUN npm run build --prod

# Fase de ejecución
FROM nginx:alpine

# Copia los archivos compilados desde la fase de compilación a Nginx
COPY --from=build /app/dist/proyecto /usr/share/nginx/html

# Copia el archivo de configuración de Nginx personalizado
COPY nginx.conf /etc/nginx/nginx.conf

# Expone el puerto que utiliza Nginx
EXPOSE 80

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]