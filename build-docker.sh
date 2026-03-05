#!/bin/bash

# ScanQueue - Docker Build
# Construir imagen Docker para ScanQueue

echo "🐳 Construyendo imagen Docker de ScanQueue..."

# Build
docker build -t scanqueue:latest .

echo "✅ Imagen construida: scanqueue:latest"
echo ""
echo "Para ejecutar:"
echo "  docker run -p 3000:3000 -p 3001:3001 scanqueue:latest"
