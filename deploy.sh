#!/bin/bash

# ============================================
# ScanQueue Production Deployment Script
# ============================================
# Uso: ./deploy.sh [opciones]
# Ejemplo: ./deploy.sh --build --migrate

set -e  # Exit on error

# ============================================
# Colors
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# Configuration
# ============================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.production"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.prod.yml"
LOG_FILE="$SCRIPT_DIR/deploy.log"
BACKUP_DIR="$SCRIPT_DIR/backups"

# ============================================
# Logging
# ============================================
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[OK]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# ============================================
# Functions
# ============================================

check_prerequisites() {
    log "Validando prerequisitos..."

    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado"
        exit 1
    fi
    success "Docker instalado: $(docker --version)"

    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose no está instalado"
        exit 1
    fi
    success "Docker Compose instalado: $(docker-compose --version)"

    # Verificar archivo .env
    if [ ! -f "$ENV_FILE" ]; then
        error "Archivo .env.production no encontrado"
        echo "Copiar .env.production.example a .env.production:"
        echo "  cp .env.production.example .env.production"
        exit 1
    fi
    success ".env.production encontrado"
}

validate_env() {
    log "Validando variables de entorno..."
    
    local required_vars=(
        "DATABASE_PASSWORD"
        "JWT_SECRET"
        "CORS_ORIGIN"
    )

    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$ENV_FILE" || grep "^${var}=CAMBIAR_ESTO" "$ENV_FILE" > /dev/null; then
            error "Variable $var no configurada correctamente en .env.production"
            exit 1
        fi
    done
    
    success "Variables de entorno validadas"
}

backup_database() {
    log "Realizando backup de la base de datos..."
    
    mkdir -p "$BACKUP_DIR"
    
    local backup_file="$BACKUP_DIR/db_$(date +'%Y%m%d_%H%M%S').sql.gz"
    
    docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump \
        -U "${DATABASE_USER:-scanqueue}" \
        "${DATABASE_NAME:-scanqueue}" | gzip > "$backup_file"
    
    if [ $? -eq 0 ]; then
        success "Backup guardado: $backup_file"
    else
        warning "Error durante el backup (continuando...)"
    fi
}

build_images() {
    log "Construyendo imágenes Docker..."
    
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    if [ $? -eq 0 ]; then
        success "Imágenes construidas exitosamente"
    else
        error "Error al construir imágenes"
        exit 1
    fi
}

stop_services() {
    log "Deteniendo servicios existentes..."
    
    docker-compose -f "$COMPOSE_FILE" down || true
    
    sleep 2
    success "Servicios detenidos"
}

start_services() {
    log "Iniciando servicios..."
    
    docker-compose -f "$COMPOSE_FILE" up -d
    
    if [ $? -eq 0 ]; then
        success "Servicios iniciados"
    else
        error "Error al iniciar servicios"
        exit 1
    fi
}

wait_for_services() {
    log "Esperando a que los servicios estén listos..."
    
    local max_attempts=30
    local attempt=0
    
    until [ $attempt -ge $max_attempts ]; do
        # Verificar PostgreSQL
        if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "${DATABASE_USER:-scanqueue}" &> /dev/null; then
            success "PostgreSQL está listo"
            break
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 1
    done
    
    if [ $attempt -ge $max_attempts ]; then
        error "Timeout esperando por PostgreSQL"
        exit 1
    fi
    
    # Esperar backend
    sleep 5
    log "Esperando Backend..."
    attempt=0
    until [ $attempt -ge 30 ]; do
        if curl -f http://localhost:5000/api/health &> /dev/null; then
            success "Backend está listo"
            break
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 1
    done
    
    # Esperar Frontend
    sleep 5
    log "Esperando Frontend..."
    attempt=0
    until [ $attempt -ge 30 ]; do
        if curl -f http://localhost/health &> /dev/null; then
            success "Frontend está listo"
            break
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 1
    done
    
    echo ""
}

run_migrations() {
    if [ "$RUN_MIGRATIONS" = true ]; then
        log "Ejecutando migraciones de base de datos..."
        
        docker-compose -f "$COMPOSE_FILE" exec -T backend npm run db:migrate || \
        docker-compose -f "$COMPOSE_FILE" exec -T backend node database/init.js
        
        success "Migraciones completadas"
    fi
}

run_seeding() {
    if [ "$RUN_SEEDING" = true ]; then
        log "Ejecutando seed de datos..."
        
        docker-compose -f "$COMPOSE_FILE" exec -T backend npm run db:seed || \
        docker-compose -f "$COMPOSE_FILE" exec -T backend node database/seed.js
        
        success "Datos seeding completados"
    fi
}

health_check() {
    log "Verificando salud de servicios..."
    
    local all_healthy=true
    
    # Verificar PostgreSQL
    log "Verificando PostgreSQL..."
    if docker-compose -f "$COMPOSE_FILE" ps postgres | grep "Up" &> /dev/null; then
        success "PostgreSQL está en funcionamiento"
    else
        error "PostgreSQL no está en funcionamiento"
        all_healthy=false
    fi
    
    # Verificar Backend
    log "Verificando Backend..."
    if curl -f http://localhost:5000/api/health &> /dev/null; then
        success "Backend está respondiendo"
    else
        error "Backend no está respondiendo"
        all_healthy=false
    fi
    
    # Verificar Frontend
    log "Verificando Frontend..."
    if curl -f http://localhost/health &> /dev/null; then
        success "Frontend está respondiendo"
    else
        error "Frontend no está respondiendo"
        all_healthy=false
    fi
    
    if [ "$all_healthy" = false ]; then
        error "Algunos servicios no están saludables"
        return 1
    fi
}

test_endpoints() {
    log "Probando endpoints API..."
    
    log "Probando GET /api/health"
    curl -s http://localhost:5000/api/health | tail -5
    
    log "Probando GET /api/students"
    curl -s http://localhost:5000/api/students | head -20
}

show_summary() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✓ DEPLOYMENT COMPLETADO EXITOSAMENTE    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}URLs de Acceso:${NC}"
    echo -e "  Frontend:  ${GREEN}https://$(grep DOMAIN .env.production | cut -d= -f2)${NC}"
    echo -e "  API:       ${GREEN}https://$(grep DOMAIN .env.production | cut -d= -f2)/api${NC}"
    echo -e "  WebSocket: ${GREEN}wss://$(grep DOMAIN .env.production | cut -d= -f2)/ws${NC}"
    echo ""
    echo -e "${BLUE}Comandos útiles:${NC}"
    echo -e "  Ver logs:         ${YELLOW}docker-compose -f docker-compose.prod.yml logs -f${NC}"
    echo -e "  Estado:           ${YELLOW}docker-compose -f docker-compose.prod.yml ps${NC}"
    echo -e "  Parar:            ${YELLOW}docker-compose -f docker-compose.prod.yml down${NC}"
    echo -e "  Iniciar:          ${YELLOW}docker-compose -f docker-compose.prod.yml up -d${NC}"
    echo -e "  Backup manual:    ${YELLOW}bash backup.sh${NC}"
    echo ""
    echo -e "${BLUE}Log de deployment:${NC}"
    echo -e "  ${YELLOW}$LOG_FILE${NC}"
    echo ""
}

show_usage() {
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  --build              Construir imágenes Docker"
    echo "  --migrate            Ejecutar migraciones de BD"
    echo "  --seed               Ejecutar seeding de datos"
    echo "  --backup             Realizar backup antes de deploy"
    echo "  --full               Build + migrate + seed + backup (recomendado para primera ejecución)"
    echo "  --rollback           Revertir a deployment anterior"
    echo "  --health-check       Solo verificar salud de servicios"
    echo "  --help               Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 --build              # Build y levanta servicios"
    echo "  $0 --full               # Deployment completo (primera vez)"
    echo "  $0 --migrate --seed     # Build + migraciones + seed"
}

# ============================================
# Main Script
# ============================================

main() {
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     ScanQueue Production Deployment       ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Default values
    BUILD=false
    RUN_MIGRATIONS=false
    RUN_SEEDING=false
    DO_BACKUP=false
    HEALTH_ONLY=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --build) BUILD=true; shift ;;
            --migrate) RUN_MIGRATIONS=true; shift ;;
            --seed) RUN_SEEDING=true; shift ;;
            --backup) DO_BACKUP=true; shift ;;
            --full) BUILD=true; RUN_MIGRATIONS=true; RUN_SEEDING=true; DO_BACKUP=true; shift ;;
            --health-check) HEALTH_ONLY=true; shift ;;
            --help) show_usage; exit 0 ;;
            *) error "Opción desconocida: $1"; show_usage; exit 1 ;;
        esac
    done
    
    # Verificar si solo es health check
    if [ "$HEALTH_ONLY" = true ]; then
        health_check
        exit $?
    fi
    
    # Ejecución principal
    check_prerequisites
    validate_env
    
    if [ "$DO_BACKUP" = true ]; then
        backup_database
    fi
    
    if [ "$BUILD" = true ]; then
        build_images
    fi
    
    stop_services
    start_services
    wait_for_services
    
    run_migrations
    run_seeding
    
    health_check
    test_endpoints
    show_summary
}

# Ejecutar main
main "$@"
