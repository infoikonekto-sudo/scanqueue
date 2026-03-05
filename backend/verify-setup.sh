#!/bin/bash

# Script de verificación - ScanQueue Backend Setup
# Verifica que todos los componentes estén correctamente instalados

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   ScanQueue Backend - Verificación de Setup               ║"
echo "║   $(date '+%d de %B de %Y')                                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
CHECKS_PASSED=0
CHECKS_FAILED=0

# Función para verificar
check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}✗${NC} $1"
    ((CHECKS_FAILED++))
  fi
}

echo -e "${BLUE}[1/5] VERIFICANDO REQUISITOS DEL SISTEMA${NC}"
echo "────────────────────────────────────────────────────────────"

# Verificar Node.js
command -v node > /dev/null 2>&1
check "Node.js instalado"

# Verificar npm
command -v npm > /dev/null 2>&1
check "npm instalado"

# Verificar PostgreSQL
command -v psql > /dev/null 2>&1
check "PostgreSQL instalado"

# Verificar git
command -v git > /dev/null 2>&1
check "Git instalado"

echo ""
echo -e "${BLUE}[2/5] VERIFICANDO ESTRUCTURA DE CARPETAS${NC}"
echo "────────────────────────────────────────────────────────────"

# Verificar carpetas principales
[ -d "src/config" ] && check "📁 src/config/" || echo -e "${RED}✗${NC} src/config/"
[ -d "src/routes" ] && check "📁 src/routes/" || echo -e "${RED}✗${NC} src/routes/"
[ -d "src/controllers" ] && check "📁 src/controllers/" || echo -e "${RED}✗${NC} src/controllers/"
[ -d "src/models" ] && check "📁 src/models/" || echo -e "${RED}✗${NC} src/models/"
[ -d "src/services" ] && check "📁 src/services/" || echo -e "${RED}✗${NC} src/services/"
[ -d "src/middleware" ] && check "📁 src/middleware/" || echo -e "${RED}✗${NC} src/middleware/"
[ -d "src/utils" ] && check "📁 src/utils/" || echo -e "${RED}✗${NC} src/utils/"
[ -d "database" ] && check "📁 database/" || echo -e "${RED}✗${NC} database/"

echo ""
echo -e "${BLUE}[3/5] VERIFICANDO ARCHIVOS PRINCIPALES${NC}"
echo "────────────────────────────────────────────────────────────"

# Verificar archivos clave
[ -f "src/server.js" ] && check "📄 src/server.js" || echo -e "${RED}✗${NC} src/server.js"
[ -f "package.json" ] && check "📄 package.json" || echo -e "${RED}✗${NC} package.json"
[ -f ".env.example" ] && check "📄 .env.example" || echo -e "${RED}✗${NC} .env.example"
[ -f "database/schema.sql" ] && check "📄 database/schema.sql" || echo -e "${RED}✗${NC} database/schema.sql"
[ -f "database/seeds.sql" ] && check "📄 database/seeds.sql" || echo -e "${RED}✗${NC} database/seeds.sql"
[ -f "README.md" ] && check "📄 README.md" || echo -e "${RED}✗${NC} README.md"

echo ""
echo -e "${BLUE}[4/5] VERIFICANDO DEPENDENCIAS${NC}"
echo "────────────────────────────────────────────────────────────"

if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} node_modules existe"
  ((CHECKS_PASSED++))
  
  # Verificar dependencias críticas
  [ -d "node_modules/express" ] && check "  ├─ express" || echo -e "${RED}✗${NC}   ├─ express"
  [ -d "node_modules/pg" ] && check "  ├─ pg" || echo -e "${RED}✗${NC}   ├─ pg"
  [ -d "node_modules/jsonwebtoken" ] && check "  ├─ jsonwebtoken" || echo -e "${RED}✗${NC}   ├─ jsonwebtoken"
  [ -d "node_modules/bcryptjs" ] && check "  ├─ bcryptjs" || echo -e "${RED}✗${NC}   ├─ bcryptjs"
  [ -d "node_modules/qrcode" ] && check "  ├─ qrcode" || echo -e "${RED}✗${NC}   ├─ qrcode"
  [ -d "node_modules/socket.io" ] && check "  ├─ socket.io" || echo -e "${RED}✗${NC}   ├─ socket.io"
  [ -d "node_modules/joi" ] && check "  ├─ joi" || echo -e "${RED}✗${NC}   ├─ joi"
  [ -d "node_modules/cors" ] && check "  └─ cors" || echo -e "${RED}✗${NC}   └─ cors"
else
  echo -e "${YELLOW}⚠${NC} node_modules no existe - ejecutar: npm install"
  ((CHECKS_FAILED++))
fi

echo ""
echo -e "${BLUE}[5/5] VERIFICANDO CONFIGURACIÓN${NC}"
echo "────────────────────────────────────────────────────────────"

if [ -f ".env" ]; then
  echo -e "${GREEN}✓${NC} .env existe"
  ((CHECKS_PASSED++))
  
  # Verificar variables críticas
  if grep -q "DB_HOST" .env; then echo -e "${GREEN}✓${NC}  ├─ DB_HOST configurado"; ((CHECKS_PASSED++)); else echo -e "${RED}✗${NC}  ├─ DB_HOST"; ((CHECKS_FAILED++)); fi
  if grep -q "DB_PORT" .env; then echo -e "${GREEN}✓${NC}  ├─ DB_PORT configurado"; ((CHECKS_PASSED++)); else echo -e "${RED}✗${NC}  ├─ DB_PORT"; ((CHECKS_FAILED++)); fi
  if grep -q "DB_NAME" .env; then echo -e "${GREEN}✓${NC}  ├─ DB_NAME configurado"; ((CHECKS_PASSED++)); else echo -e "${RED}✗${NC}  ├─ DB_NAME"; ((CHECKS_FAILED++)); fi
  if grep -q "JWT_SECRET" .env; then echo -e "${GREEN}✓${NC}  ├─ JWT_SECRET configurado"; ((CHECKS_PASSED++)); else echo -e "${RED}✗${NC}  ├─ JWT_SECRET"; ((CHECKS_FAILED++)); fi
  if grep -q "PORT" .env; then echo -e "${GREEN}✓${NC}  └─ PORT configurado"; ((CHECKS_PASSED++)); else echo -e "${RED}✗${NC}  └─ PORT"; ((CHECKS_FAILED++)); fi
else
  echo -e "${YELLOW}⚠${NC} .env no existe - ejecutar: cp .env.example .env"
  ((CHECKS_FAILED++))
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo -e "║   RESULTADOS: ${GREEN}✓ Pasadas: $CHECKS_PASSED${NC}  |  ${RED}✗ Fallidas: $CHECKS_FAILED${NC}           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Resumen y próximos pasos
if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ SETUP COMPLETADO - TODO LISTO PARA INICIAR${NC}"
  echo ""
  echo "Próximos pasos:"
  echo "  1. npm run db:init     (inicializar base de datos)"
  echo "  2. npm run db:seed     (cargar datos de ejemplo)"
  echo "  3. npm run dev         (iniciar servidor)"
  echo "  4. curl http://localhost:5000/health  (test)"
else
  echo -e "${RED}⚠️  SE ENCONTRARON PROBLEMAS - VER ARRIBA${NC}"
  echo ""
  echo "Acciones recomendadas:"
  echo "  1. Revisar archivo: README.md"
  echo "  2. Ejecutar: npm install"
  echo "  3. Ejecutar: cp .env.example .env"
  echo "  4. Configurar variables en .env"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Para más información, consulta: README.md                ║"
echo "╚════════════════════════════════════════════════════════════╝"
