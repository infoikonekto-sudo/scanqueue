FROM node:18-alpine

WORKDIR /app

# Instalar dependencias globales
RUN npm install -g turbo

# Copiar monorepo
COPY . .

# Instalar dependencias
WORKDIR /app/backend
RUN npm install

WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Volver al directorio raíz
WORKDIR /app

# Exponer puertos
EXPOSE 3000 3001

# Script de inicio
CMD ["sh", "-c", "cd backend && npm run dev & cd frontend && npm run preview"]
