FROM node:18-alpine

WORKDIR /app

# Copiar configuración de dependencias del backend
COPY backend/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código del backend
COPY backend/ ./

# Exponer el puerto
EXPOSE 5000

# Comando para iniciar el backend
CMD ["npm", "start"]
