#!/bin/bash

# Script para hacer testing de endpoints de ScanQueue API
# Requiere curl y jq (para formatear JSON)

BASE_URL="http://localhost:5000/api"
TOKEN=""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== ScanQueue API Testing ===${NC}\n"

# 1. LOGIN
echo -e "${YELLOW}[TEST] Autenticación (Login)${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operator@scanqueue.local",
    "password": "admin123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
  echo -e "${GREEN}✓ Token obtenido: ${TOKEN:0:20}...${NC}\n"
else
  echo -e "${RED}✗ Error al obtener token${NC}\n"
  exit 1
fi

# 2. OBTENER PERFIL
echo -e "${YELLOW}[TEST] Obtener perfil${NC}"
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 3. LISTAR ESTUDIANTES
echo -e "${YELLOW}[TEST] Listar estudiantes${NC}"
curl -s -X GET "$BASE_URL/students?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 4. OBTENER ESTADÍSTICAS
echo -e "${YELLOW}[TEST] Estadísticas del dashboard${NC}"
curl -s -X GET "$BASE_URL/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 5. OBTENER QUEUE
echo -e "${YELLOW}[TEST] Obtener cola de escaneos${NC}"
curl -s -X GET "$BASE_URL/scan/queue" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 6. OBTENER RUTAS
echo -e "${YELLOW}[TEST] Obtener rutas de transporte${NC}"
curl -s -X GET "$BASE_URL/routes" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

echo -e "${YELLOW}=== Testing Completado ===${NC}"
