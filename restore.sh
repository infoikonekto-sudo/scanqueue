#!/bin/bash

# ============================================
# ScanQueue Restore Script
# ============================================
# Restaurar desde backup
# Uso: ./restore.sh <backup_file> [opciones]

set -e

# ============================================
# Configuration
# ============================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/backups"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.prod.yml"
ENV_FILE="${SCRIPT_DIR}/.env.production"
LOG_FILE="${BACKUP_DIR}/restore.log"

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
    echo -e "${GREEN}[OK]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# ============================================
# Functions
# ============================================

show_usage() {
    echo "Uso: $0 <backup_file> [opciones]"
    echo ""
    echo "Argumentos:"
    echo "  backup_file    Archivo SQL.GZ a restaurar (ej: database_20240301_120000.sql.gz)"
    echo ""
    echo "Opciones:"
    echo "  --dry-run      Simular restore sin hacer cambios"
    echo "  --force        Forzar restore sin confirmación"
    echo "  --verify       Verificar integridad del backup"
    echo ""
    echo "Ejemplos:"
    echo "  $0 database_20240301_120000.sql.gz"
    echo "  $0 --verify database_20240301_120000.sql.gz"
    echo "  $0 --dry-run database_20240301_120000.sql.gz"
}

check_prerequisites() {
    if [ ! -f "$ENV_FILE" ]; then
        error "Archivo .env.production no encontrado"
        exit 1
    fi
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        error "Archivo docker-compose.prod.yml no encontrado"
        exit 1
    fi
}

list_available_backups() {
    echo ""
    echo -e "${BLUE}=== BACKUPS DISPONIBLES ===${NC}"
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR"/*.sql.gz 2>/dev/null)" ]; then
        warning "No hay backups de base de datos disponibles"
        return
    fi
    
    echo "Base de Datos:"
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    
    if [ -n "$(ls -A "$BACKUP_DIR"/*.tar.gz 2>/dev/null)" ]; then
        echo ""
        echo "Otros (uploads, logs, config):"
        ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    fi
    echo ""
}

verify_backup() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        error "Archivo de backup no encontrado: $backup_file"
        return 1
    fi
    
    log "Verificando integridad del backup..."
    
    if gzip -t "$backup_file" 2>/dev/null; then
        success "Backup válido y completo"
        return 0
    else
        error "Backup corrupto o inválido"
        return 1
    fi
}

restore_database() {
    local backup_file="$1"
    local dry_run="$2"
    
    if [ ! -f "$backup_file" ]; then
        error "Archivo de backup no encontrado: $backup_file"
        return 1
    fi
    
    log "Preparando para restaurar desde: $(basename $backup_file)"
    
    local db_name=$(grep "^DATABASE_NAME=" "$ENV_FILE" | cut -d= -f2)
    local db_user=$(grep "^DATABASE_USER=" "$ENV_FILE" | cut -d= -f2)
    
    if [ "$dry_run" = true ]; then
        log "[DRY RUN] Sería restaurado en BD: $db_name"
        log "[DRY RUN] Usuario: $db_user"
        log "[DRY RUN] Tamaño: $(du -h "$backup_file" | cut -f1)"
        return 0
    fi
    
    # Confirmación
    echo ""
    echo -e "${YELLOW}⚠️  ADVERTENCIA:${NC}"
    echo "Esta operación reemplazará la base de datos actual con el backup."
    echo "Esto eliminará TODOS los datos actuales."
    echo ""
    read -p "¿Confirmar restauración? (escriba 'SI' en mayúsculas): " confirm
    
    if [ "$confirm" != "SI" ]; then
        warning "Operación cancelada por el usuario"
        return 1
    fi
    
    log "Iniciando restauración de base de datos..."
    
    # Crear backup de seguridad antes
    log "Creando backup de seguridad de la BD actual..."
    local safety_backup="${BACKUP_DIR}/pre_restore_$(date +'%Y%m%d_%H%M%S').sql.gz"
    docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump \
        -U "$db_user" "$db_name" | gzip > "$safety_backup"
    success "Backup de seguridad: $safety_backup"
    
    # Restaurar
    log "Restaurando base de datos..."
    if gunzip -c "$backup_file" | \
        docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U "$db_user" "$db_name"; then
        success "Base de datos restaurada exitosamente"
        return 0
    else
        error "Error durante la restauración"
        warning "Backup de seguridad disponible: $safety_backup"
        return 1
    fi
}

restore_uploads() {
    local backup_file="$1"
    local dry_run="$2"
    
    if [ ! -f "$backup_file" ]; then
        warning "Archivo de backup de uploads no encontrado: $backup_file"
        return 0
    fi
    
    log "Preparando para restaurar uploads desde: $(basename $backup_file)"
    
    local upload_dir="${SCRIPT_DIR}/backend/uploads"
    
    if [ "$dry_run" = true ]; then
        log "[DRY RUN] Sería restaurado en: $upload_dir"
        return 0
    fi
    
    # Confirmación
    echo ""
    read -p "¿Restaurar también los archivos cargados? (s/n): " confirm
    
    if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
        warning "Restauración de uploads cancelada"
        return 0
    fi
    
    # Crear backup de seguridad
    if [ -d "$upload_dir" ]; then
        log "Creando backup de seguridad de uploads actuales..."
        tar -czf "${BACKUP_DIR}/pre_restore_uploads_$(date +'%Y%m%d_%H%M%S').tar.gz" \
            -C "$upload_dir" . 2>/dev/null || true
    fi
    
    log "Restaurando archivos..."
    mkdir -p "$upload_dir"
    tar -xzf "$backup_file" -C "$upload_dir"
    
    success "Uploads restaurados"
    return 0
}

verify_restore() {
    log "Verificando restauración..."
    
    # Verificar BD
    local db_name=$(grep "^DATABASE_NAME=" "$ENV_FILE" | cut -d= -f2)
    local db_user=$(grep "^DATABASE_USER=" "$ENV_FILE" | cut -d= -f2)
    
    if docker-compose -f "$COMPOSE_FILE" exec -T postgres \
        psql -U "$db_user" -d "$db_name" -c "SELECT COUNT(*) FROM students;" &>/dev/null; then
        success "Base de datos accesible"
    else
        error "No se puede acceder a la base de datos"
        return 1
    fi
    
    # Verificar servicios
    if curl -f http://localhost:5000/api/health &>/dev/null; then
        success "Backend accesible"
    else
        warning "Backend no responde (reintentando en 10s...)"
        sleep 10
        if curl -f http://localhost:5000/api/health &>/dev/null; then
            success "Backend accesible (después de esperar)"
        else
            error "Backend no responde"
        fi
    fi
    
    return 0
}

restart_services() {
    local dry_run="$1"
    
    if [ "$dry_run" = true ]; then
        log "[DRY RUN] Sería reiniciados los servicios"
        return 0
    fi
    
    log "Reiniciando servicios..."
    
    docker-compose -f "$COMPOSE_FILE" restart postgres backend frontend
    
    success "Servicios reiniciados"
    
    # Esperar servicios
    sleep 10
}

# ============================================
# Main
# ============================================

main() {
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║      ScanQueue Restore Script             ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Parse arguments
    local backup_file=""
    local dry_run=false
    local force=false
    local verify_only=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run) dry_run=true; shift ;;
            --force) force=true; shift ;;
            --verify) verify_only=true; shift ;;
            --help) show_usage; exit 0 ;;
            *)
                if [[ ! $1 =~ ^- ]]; then
                    backup_file="$1"
                fi
                shift
            ;;
        esac
    done
    
    check_prerequisites
    list_available_backups
    
    # Si no se especificó archivo, mostrar error
    if [ -z "$backup_file" ]; then
        error "Debe especificar un archivo de backup"
        echo ""
        show_usage
        exit 1
    fi
    
    # Ruta completa del backup
    if [[ ! "$backup_file" =~ ^/ ]]; then
        backup_file="${BACKUP_DIR}/${backup_file}"
    fi
    
    # Solo verificar
    if [ "$verify_only" = true ]; then
        verify_backup "$backup_file"
        exit $?
    fi
    
    # Verificar integridad
    if ! verify_backup "$backup_file"; then
        error "Backup corrupto, abortando"
        exit 1
    fi
    
    # Proceder con restauración
    if restore_database "$backup_file" "$dry_run"; then
        # Restaurar uploads si existe el backup
        uploads_backup=$(dirname "$backup_file")/uploads_*.tar.gz
        if [ -f $uploads_backup 2>/dev/null ]; then
            restore_uploads "$uploads_backup" "$dry_run"
        fi
        
        # Reiniciar servicios
        restart_services "$dry_run"
        
        # Verificar
        if [ "$dry_run" = false ]; then
            verify_restore
            
            echo ""
            echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
            echo -e "${GREEN}║    ✓ RESTAURACIÓN COMPLETADA              ║${NC}"
            echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
            echo ""
        fi
    else
        error "Fallo la restauración"
        exit 1
    fi
}

main "$@"
