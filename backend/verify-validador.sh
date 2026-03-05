#!/bin/bash

# SCRIPT DE VERIFICACIÓN: Validador de Códigos QR/Barras
# Verifica que todos los archivos estén en su lugar

echo "╔════════════════════════════════════════════════════════╗"
echo "║  VERIFICACIÓN: AGENTE VALIDADOR QR/BARRAS             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Variables de color
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador
total=0
encontrados=0

# Función para verificar archivo
check_file() {
  local file=$1
  local description=$2
  
  total=$((total + 1))
  
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅${NC} $description"
    echo "   📁 $file"
    encontrados=$((encontrados + 1))
  else
    echo -e "${RED}❌${NC} $description"
    echo "   📁 $file (NO ENCONTRADO)"
  fi
  echo ""
}

# Función para verificar directorio
check_dir() {
  local dir=$1
  local description=$2
  
  total=$((total + 1))
  
  if [ -d "$dir" ]; then
    echo -e "${GREEN}✅${NC} $description"
    echo "   📁 $dir"
    encontrados=$((encontrados + 1))
  else
    echo -e "${RED}❌${NC} $description"
    echo "   📁 $dir (NO ENCONTRADO)"
  fi
  echo ""
}

echo "=== SERVICIOS ==="
check_file "./src/services/ValidationService.js" "Servicio de Validación Principal"
check_file "./src/services/DuplicateCache.js" "Caché de Duplicados"
check_file "./src/services/AuditLogger.js" "Logger de Auditoría"
check_file "./src/services/CodeGeneratorService.js" "Generador QR/Barcode"
check_file "./src/services/ValidationService.test.js" "Tests Unitarios"

echo "=== CONTROLADORES ==="
check_file "./src/controllers/ScanController.js" "Controlador de Escaneos"

echo "=== RUTAS ==="
check_file "./src/routes/scans.js" "Rutas de Escaneo"

echo "=== UTILIDADES ==="
check_file "./src/utils/helpers.js" "Funciones Auxiliares (con Levenshtein)"

echo "=== ÍNDICE ==="
check_file "./src/index.js" "Índice de Exportaciones"

echo "=== DOCUMENTACIÓN ==="
check_file "./VALIDADOR_TECNICO.md" "Documentación Técnica"
check_file "./GUIA_IMPLEMENTACION.md" "Guía de Implementación"
check_file "./ENTREGA_VALIDADOR.md" "Resumen de Entrega"
check_file "./EJEMPLOS_USO.js" "Ejemplos de Uso"

echo "=== DIRECTORIOS REQUERIDOS ==="
check_dir "./logs" "Directorio de Logs"

echo "╔════════════════════════════════════════════════════════╗"
echo "║                    RESUMEN FINAL                       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Archivos encontrados: $encontrados/$total"
echo ""

if [ $encontrados -eq $total ]; then
  echo -e "${GREEN}✅ TODOS LOS ARCHIVOS ESTÁN EN LUGAR${NC}"
  echo ""
  echo "=== PRÓXIMOS PASOS ==="
  echo "1. Instalar dependencias: npm install"
  echo "2. Configurar .env: DUPLICATE_SCAN_TIMEOUT=30"
  echo "3. Inicializar BD: npm run db:init"
  echo "4. Ejecutar tests: node src/services/ValidationService.test.js"
  echo "5. Iniciar servidor: npm run dev"
  echo ""
  exit 0
else
  echo -e "${RED}❌ ALGUNOS ARCHIVOS ESTÁN FALTANDO${NC}"
  echo "Faltan: $((total - encontrados)) archivo(s)"
  echo ""
  exit 1
fi
