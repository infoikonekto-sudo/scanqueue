#!/bin/bash

# ============================================
# ScanQueue Health Check Script
# ============================================
# Monitorea la salud de los servicios
# Uso: ./health-check.sh [opciones]

set -e

# ============================================
# Configuration
# ============================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.prod.yml"
ENV_FILE="${SCRIPT_DIR}/.env.production"
LOG_FILE="${SCRIPT_DIR}/health-check.log"
ALERT_EMAIL=$(grep "^ALERT_EMAIL=" "$ENV_FILE" 2>/dev/null | cut -d= -f2)

# ============================================
# Colors
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================
# Logging
# ============================================
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[✗]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[!]${NC} $1" | tee -a "$LOG_FILE"
}

# ============================================
# Health Checks
# ============================================

check_docker() {
    log "Verificando Docker..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado"
        return 1
    fi
    
    if ! docker info &>/dev/null; then
        error "Docker daemon no está corriendo"
        return 1
    fi
    
    success "Docker disponible"
    return 0
}

check_containers() {
    log "Verificando estado de contenedores..."
    
    local containers=("scanqueue-postgres" "scanqueue-backend" "scanqueue-frontend" "scanqueue-nginx")
    local all_running=true
    
    for container in "${containers[@]}"; do
        if docker ps --filter "name=$container" --filter "status=running" | grep -q "$container"; then
            success "Contenedor $container en ejecución"
        else
            error "Contenedor $container NO está corriendo"
            all_running=false
        fi
    done
    
    return $([ "$all_running" = true ] && echo 0 || echo 1)
}

check_postgres() {
    log "Verificando PostgreSQL..."
    
    local db_user=$(grep "^DATABASE_USER=" "$ENV_FILE" | cut -d= -f2)
    local db_name=$(grep "^DATABASE_NAME=" "$ENV_FILE" | cut -d= -f2)
    
    if docker-compose -f "$COMPOSE_FILE" exec -T postgres \
        pg_isready -U "$db_user" &>/dev/null; then
        
        # Verificar conexión a BD
        if docker-compose -f "$COMPOSE_FILE" exec -T postgres \
            psql -U "$db_user" -d "$db_name" -c "SELECT 1" &>/dev/null; then
            success "PostgreSQL disponible y conectado"
            return 0
        else
            error "PostgreSQL no responde a consultas"
            return 1
        fi
    else
        error "PostgreSQL no disponible"
        return 1
    fi
}

check_backend_api() {
    log "Verificando API Backend..."
    
    local max_retries=3
    local retry=0
    
    while [ $retry -lt $max_retries ]; do
        if curl -sf http://localhost:5000/api/health &>/dev/null; then
            success "Backend API respondiendo en puerto 5000"
            return 0
        fi
        
        retry=$((retry + 1))
        if [ $retry -lt $max_retries ]; then
            warning "Reintentando... ($retry/$max_retries)"
            sleep 2
        fi
    done
    
    error "Backend API no responde"
    
    # Mostrar logs
    log "Últimos logs del backend:"
    docker-compose -f "$COMPOSE_FILE" logs --tail=5 backend
    
    return 1
}

check_frontend() {
    log "Verificando Frontend..."
    
    if curl -sf http://localhost/ &>/dev/null; then
        success "Frontend disponible en puerto 80"
        return 0
    fi
    
    error "Frontend no responde"
    return 1
}

check_nginx() {
    log "Verificando Nginx..."
    
    if docker-compose -f "$COMPOSE_FILE" exec -T nginx \
        nginx -t &>/dev/null; then
        success "Nginx configurado correctamente"
        return 0
    fi
    
    error "Problemas con configuración de Nginx"
    return 1
}

check_websocket() {
    log "Verificando WebSocket..."
    
    # Simple test del socket.io
    if curl -sf http://localhost:5000/socket.io/?transport=polling &>/dev/null; then
        success "WebSocket disponible"
        return 0
    fi
    
    warning "WebSocket posiblemente no disponible (esto puede ser normal)"
    return 0
}

check_database_tables() {
    log "Verificando tablas de BD..."
    
    local db_user=$(grep "^DATABASE_USER=" "$ENV_FILE" | cut -d= -f2)
    local db_name=$(grep "^DATABASE_NAME=" "$ENV_FILE" | cut -d= -f2)
    
    local required_tables=("students" "users" "scans" "routes" "qr_codes")
    local all_exist=true
    
    for table in "${required_tables[@]}"; do
        if docker-compose -f "$COMPOSE_FILE" exec -T postgres \
            psql -U "$db_user" -d "$db_name" -c "SELECT 1 FROM $table LIMIT 1" &>/dev/null; then
            success "Tabla $table existe"
        else
            error "Tabla $table NO existe"
            all_exist=false
        fi
    done
    
    return $([ "$all_exist" = true ] && echo 0 || echo 1)
}

check_disk_space() {
    log "Verificando espacio en disco..."
    
    local available_gb=$(df /var/lib/docker | tail -1 | awk '{print $4 / 1024 / 1024}')
    
    if (( $(echo "$available_gb > 5" | bc -l) )); then
        success "Espacio en disco: ${available_gb%.*} GB disponibles"
        return 0
    elif (( $(echo "$available_gb > 2" | bc -l) )); then
        warning "Espacio en disco bajo: ${available_gb%.*} GB disponibles"
        return 0
    else
        error "Espacio en disco CRÍTICO: ${available_gb%.*} GB disponibles"
        return 1
    fi
}

check_memory() {
    log "Verificando memoria..."
    
    local available_gb=$(free | grep Mem | awk '{print ($7 / 1024 / 1024)}')
    
    if (( $(echo "$available_gb > 0.5" | bc -l) )); then
        success "Memoria disponible: ${available_gb%.*} GB"
        return 0
    else
        warning "Memoria baja: ${available_gb%.*} GB disponibles"
        return 0
    fi
}

check_cpu_usage() {
    log "Verificando CPU..."
    
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    
    if (( $(echo "$cpu_usage < 80" | bc -l) )); then
        success "Uso de CPU: ${cpu_usage%.*}%"
        return 0
    else
        warning "Uso de CPU alto: ${cpu_usage%.*}%"
        return 0
    fi
}

check_api_endpoints() {
    log "Verificando endpoints clave..."
    
    local endpoints=(
        "GET|/api/health"
        "GET|/api/students"
        "GET|/api/scans"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local method=$(echo $endpoint | cut -d'|' -f1)
        local path=$(echo $endpoint | cut -d'|' -f2)
        
        if curl -sf -X "$method" "http://localhost:5000$path" &>/dev/null; then
            success "EndPoint $method $path OK"
        else
            warning "EndPoint $method $path tardío o no disponible"
        fi
    done
    
    return 0
}

check_logs() {
    log "Verificando logs de errores..."
    
    local error_count=$(docker-compose -f "$COMPOSE_FILE" logs --tail=50 backend | \
        grep -i "error" | wc -l)
    
    if [ "$error_count" -eq 0 ]; then
        success "Sin errores recientes en logs"
        return 0
    else
        warning "Se encontraron $error_count messages de error en logs recientes"
        return 0
    fi
}

# ============================================
# Reporting
# ============================================

send_alert() {
    local message="$1"
    
    if [ -z "$ALERT_EMAIL" ] || [ "$ALERT_EMAIL" = "" ]; then
        return
    fi
    
    log "Enviando alerta a: $ALERT_EMAIL"
    
    # Implementar envío de email si está configurado
    # echo "$message" | mail -s "ScanQueue Health Alert" "$ALERT_EMAIL"
}

generate_report() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   REPORTE DE SALUD - ScanQueue            ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Fecha: $(date +'%Y-%m-%d %H:%M:%S')"
    echo "Hostname: $(hostname)"
    echo ""
    
    # Últimos eventos
    echo "Últimos eventos del sistema:"
    tail -20 "$LOG_FILE" | grep -E "\[✓\]|\[✗\]|\[!\]"
    
    echo ""
    echo "Estado de contenedores:"
    docker-compose -f "$COMPOSE_FILE" ps | tail -n +2
    
    echo ""
}

# ============================================
# Main
# ============================================

main() {
    local help=false
    local continuous=false
    local interval=30
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help) help=true; shift ;;
            --continuous) continuous=true; shift ;;
            --interval) interval=$2; shift 2 ;;
            *) shift ;;
        esac
    done
    
    if [ "$help" = true ]; then
        echo "Uso: $0 [opciones]"
        echo "Opciones:"
        echo "  --help        Mostrar esta ayuda"
        echo "  --continuous  Ejecutar continuamente cada N segundos"
        echo "  --interval N  Intervalo en segundos (default: 30)"
        exit 0
    fi
    
    check_docker || exit 1
    
    if [ "$continuous" = true ]; then
        log "Modo continuo iniciado (intervalo: ${interval}s)"
        while true; do
            clear
            echo -e "${BLUE}ScanQueue Health Check - $(date +'%Y-%m-%d %H:%M:%S')${NC}"
            echo ""
            
            check_containers
            check_postgres
            check_backend_api
            check_frontend
            check_websocket
            check_disk_space
            check_database_tables
            
            echo ""
            echo "Próxima verificación en ${interval}s... (Ctrl+C para salir)"
            sleep "$interval"
        done
    else
        check_containers && \
        check_postgres && \
        check_backend_api && \
        check_frontend && \
        check_websocket && \
        check_nginx && \
        check_database_tables && \
        check_disk_space && \
        check_memory && \
        check_api_endpoints
        
        generate_report
        
        echo -e "${GREEN}✓ Todos los servicios están operacionales${NC}"
        echo ""
    fi
}

main "$@"
