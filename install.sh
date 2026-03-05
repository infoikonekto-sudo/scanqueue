#!/bin/bash

# ScanQueue - Script de Instalación Automática
# Instala e inicia ambos servidores en paralelo

set -e

echo "╔════════════════════════════════════════╗"
echo "║  🚀 ScanQueue Setup                   ║"
echo "║  Sistema de Cola en Tiempo Real       ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "Descárgalo desde: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"
echo "✅ npm $(npm --version) encontrado"
echo ""

# Instalar Frontend
echo "📦 Instalando Frontend..."
cd frontend
npm install --silent
echo "✅ Frontend instalado"
echo ""

# Instalar Backend
echo "📦 Instalando Backend..."
cd ../backend
npm install --silent
echo "✅ Backend instalado"
echo ""

# Crear .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando .env del backend..."
    cp .env.example .env 2>/dev/null || cat > .env << EOF
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
EOF
fi

cd ..
if [ ! -f frontend/.env ]; then
    echo "📝 Creando .env del frontend..."
    cp frontend/.env.example frontend/.env 2>/dev/null || cat > frontend/.env << EOF
REACT_APP_SOCKET_URL=http://localhost:3001
REACT_APP_ENV=development
EOF
fi

echo ""
echo "═════════════════════════════════════════"
echo "✅ Instalación completada"
echo "═════════════════════════════════════════"
echo ""
echo "🚀 Para iniciar los servidores:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   cd backend && npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   cd frontend && npm run dev"
echo ""
echo "📱 Luego abre: http://localhost:3000"
echo ""
