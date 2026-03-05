#!/bin/bash

# ScanQueue - Script de desarrollo en paralelo

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 ScanQueue - Desarrollo            ║${NC}"
echo -e "${BLUE}║  Iniciando dos servidores...           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Iniciar Backend en background
echo -e "${GREEN}▶ Iniciando Backend (http://localhost:3001)${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

sleep 2

# Iniciar Frontend
echo -e "${GREEN}▶ Iniciando Frontend (http://localhost:3000)${NC}"
cd frontend
npm run dev
FRONTEND_PID=$!

# Esperar a que se cierren
wait $FRONTEND_PID

# Si se cierra frontend, también cerrar backend
kill $BACKEND_PID 2>/dev/null
echo -e "${BLUE}✅ Servidores detenidos${NC}"
