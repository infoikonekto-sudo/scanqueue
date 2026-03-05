#!/bin/bash

# ============================================
# ScanQueue Production Deployment Setup
# ============================================
# Script inicial para preparar producción
# Uso: ./setup-production.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ============================================
# Colors
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================
# Functions
# ============================================

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================
# Main
# ============================================

main() {
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  ScanQueue Production Setup               ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""
    
    # 1. Verificar requisitos
    log "Verificando requisitos..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker no instalado"
        exit 1
    fi
    success "Docker disponible"
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose no instalado"
        exit 1
    fi
    success "Docker Compose disponible"
    
    # 2. Crear .env.production
    if [ ! -f "$SCRIPT_DIR/.env.production" ]; then
        log "Creando .env.production..."
        cp "$SCRIPT_DIR/.env.production.example" "$SCRIPT_DIR/.env.production"
        warning "IMPORTANTE: Editar .env.production con tus valores reales"
    else
        success ".env.production ya existe"
    fi
    
    # 3. Generar certificados SSL
    if [ ! -d "$SCRIPT_DIR/certs" ]; then
        log "Generando certificados SSL..."
        bash "$SCRIPT_DIR/generate-certs.sh" self-signed
        success "Certificados generados (reemplazar con Let's Encrypt en producción)"
    else
        success "Directorio de certificados existe"
    fi
    
    # 4. Crear directorios necesarios
    log "Creando directorios..."
    mkdir -p "$SCRIPT_DIR/backups"
    mkdir -p "$SCRIPT_DIR/backend/logs"
    mkdir -p "$SCRIPT_DIR/backend/uploads"
    success "Directorios creados"
    
    # 5. Hacer scripts ejecutables
    log "Haciendo scripts ejecutables..."
    chmod +x "$SCRIPT_DIR/deploy.sh"
    chmod +x "$SCRIPT_DIR/backup.sh"
    chmod +x "$SCRIPT_DIR/restore.sh"
    chmod +x "$SCRIPT_DIR/health-check.sh"
    chmod +x "$SCRIPT_DIR/generate-certs.sh"
    success "Scripts ejecutables"
    
    # 6. Mostrar próximos pasos
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         SETUP COMPLETADO                  ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Próximos pasos:"
    echo ""
    echo "1. Editar configuración:"
    echo "   ${YELLOW}nano .env.production${NC}"
    echo "   Reemplazar valores de:"
    echo "   - DATABASE_PASSWORD"
    echo "   - JWT_SECRET"
    echo "   - CORS_ORIGIN (tu dominio)"
    echo "   - SMTP_PASSWORD (si usas email)"
    echo ""
    echo "2. (Opcional) Configurar certificados Let's Encrypt:"
    echo "   ${YELLOW}./generate-certs.sh letsencrypt tudominio.com admin@tudominio.com${NC}"
    echo ""
    echo "3. Deploy inicial (COMPLETO - primera vez):"
    echo "   ${YELLOW}./deploy.sh --full${NC}"
    echo ""
    echo "4. Verificar salud de servicios:"
    echo "   ${YELLOW}./health-check.sh${NC}"
    echo ""
    echo "5. (Opcional) Configurar renovación automática de certificados:"
    echo "   ${YELLOW}./generate-certs.sh auto-renewal${NC}"
    echo ""
    echo "Comandos útiles después de deploy:"
    echo "   Ver logs:     ${YELLOW}docker-compose -f docker-compose.prod.yml logs -f backend${NC}"
    echo "   Ver status:   ${YELLOW}docker-compose -f docker-compose.prod.yml ps${NC}"
    echo "   Backup:       ${YELLOW}./backup.sh${NC}"
    echo "   Salud:        ${YELLOW}./health-check.sh --continuous${NC}"
    echo ""
    echo "Documentación:"
    echo "   ${YELLOW}cat DEPLOYMENT.md${NC}"
    echo ""
}

main "$@"
