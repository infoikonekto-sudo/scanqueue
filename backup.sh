#!/bin/bash

# ============================================
# ScanQueue Backup Script
# ============================================
# Realiza backup de BD y archivos
# Uso: ./backup.sh [opciones]

set -e

# ============================================
# Configuration
# ============================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/backups"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.prod.yml"
ENV_FILE="${SCRIPT_DIR}/.env.production"
LOG_FILE="${BACKUP_DIR}/backup.log"
RETENTION_DAYS=30

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

create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        success "Directorio de backup creado: $BACKUP_DIR"
    fi
}

backup_database() {
    log "=== BACKUP DE BASE DE DATOS ==="
    
    local db_name=$(grep "^DATABASE_NAME=" "$ENV_FILE" | cut -d= -f2)
    local db_user=$(grep "^DATABASE_USER=" "$ENV_FILE" | cut -d= -f2)
    local backup_file="${BACKUP_DIR}/database_$(date +'%Y%m%d_%H%M%S').sql.gz"
    
    log "Realizando backup de $db_name..."
    
    if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump \
        -U "$db_user" "$db_name" | gzip > "$backup_file"; then
        
        local size=$(du -h "$backup_file" | cut -f1)
        success "Backup de base de datos completado: $backup_file ($size)"
        echo "$backup_file" >> "${BACKUP_DIR}/.backup_manifest"
    else
        error "Error durante el backup de base de datos"
        return 1
    fi
}

backup_uploads() {
    log "=== BACKUP DE ARCHIVOS CARGADOS ==="
    
    local upload_dir="${SCRIPT_DIR}/backend/uploads"
    
    if [ ! -d "$upload_dir" ]; then
        warning "Directorio de uploads no encontrado: $upload_dir"
        return 0
    fi
    
    local backup_file="${BACKUP_DIR}/uploads_$(date +'%Y%m%d_%H%M%S').tar.gz"
    
    log "Comprimiendo archivos de $upload_dir..."
    
    if tar -czf "$backup_file" -C "$upload_dir" . 2>/dev/null; then
        local size=$(du -h "$backup_file" | cut -f1)
        success "Backup de uploads completado: $backup_file ($size)"
        echo "$backup_file" >> "${BACKUP_DIR}/.backup_manifest"
    else
        warning "Error durante el backup de uploads (continuando...)"
    fi
}

backup_logs() {
    log "=== BACKUP DE LOGS ==="
    
    local logs_dir="${SCRIPT_DIR}/backend/logs"
    
    if [ ! -d "$logs_dir" ]; then
        warning "Directorio de logs no encontrado: $logs_dir"
        return 0
    fi
    
    local backup_file="${BACKUP_DIR}/logs_$(date +'%Y%m%d_%H%M%S').tar.gz"
    
    log "Comprimiendo logs de $logs_dir..."
    
    if tar -czf "$backup_file" -C "$logs_dir" . 2>/dev/null; then
        local size=$(du -h "$backup_file" | cut -f1)
        success "Backup de logs completado: $backup_file ($size)"
        echo "$backup_file" >> "${BACKUP_DIR}/.backup_manifest"
    else
        warning "Error durante el backup de logs (continuando...)"
    fi
}

backup_config() {
    log "=== BACKUP DE CONFIGURACIÓN ==="
    
    local backup_file="${BACKUP_DIR}/config_$(date +'%Y%m%d_%H%M%S').tar.gz"
    
    log "Creando backup de archivos de configuración..."
    
    tar -czf "$backup_file" \
        -C "$SCRIPT_DIR" \
        docker-compose.prod.yml \
        nginx.conf \
        .env.production \
        2>/dev/null || true
    
    if [ -f "$backup_file" ]; then
        local size=$(du -h "$backup_file" | cut -f1)
        success "Backup de configuración completado: $backup_file ($size)"
        echo "$backup_file" >> "${BACKUP_DIR}/.backup_manifest"
    fi
}

cleanup_old_backups() {
    log "=== LIMPIEZA DE BACKUPS ANTIGUOS ==="
    
    local backup_count=$(find "$BACKUP_DIR" -type f \( -name "*.sql.gz" -o -name "*.tar.gz" \) | wc -l)
    log "Backups actuales: $backup_count"
    
    find "$BACKUP_DIR" -type f \( -name "*.sql.gz" -o -name "*.tar.gz" \) -mtime +$RETENTION_DAYS -delete
    
    success "Backups anteriores a $RETENTION_DAYS días eliminados"
}

upload_to_s3() {
    if ! command -v aws &> /dev/null; then
        warning "AWS CLI no instalado, saltando upload S3"
        return 0
    fi
    
    log "=== UPLOAD A S3 ==="
    
    local s3_bucket=$(grep "^AWS_S3_BUCKET=" "$ENV_FILE" | cut -d= -f2)
    
    if [ -z "$s3_bucket" ]; then
        warning "AWS_S3_BUCKET no configurado, saltando upload"
        return 0
    fi
    
    log "Subiendo backups a S3: $s3_bucket..."
    
    for backup_file in "$BACKUP_DIR"/*.{sql.gz,tar.gz} 2>/dev/null; do
        if [ -f "$backup_file" ]; then
            local filename=$(basename "$backup_file")
            aws s3 cp "$backup_file" "s3://$s3_bucket/$(date +%Y/%m/%d)/$filename"
            success "Subido: $filename"
        fi
    done
}

generate_backup_report() {
    log "=== REPORTE DE BACKUP ==="
    
    local report_file="${BACKUP_DIR}/backup_report_$(date +'%Y%m%d_%H%M%S').txt"
    
    {
        echo "=========================================="
        echo "REPORTE DE BACKUP - ScanQueue"
        echo "=========================================="
        echo "Fecha: $(date +'%Y-%m-%d %H:%M:%S')"
        echo "Directorio: $BACKUP_DIR"
        echo ""
        echo "Backups Almacenados:"
        ls -lh "$BACKUP_DIR"/*.{sql.gz,tar.gz} 2>/dev/null | awk '{print $9, "(" $5 ")"}'
        echo ""
        echo "Espacio Total:"
        du -sh "$BACKUP_DIR"
        echo ""
        echo "=========================================="
    } > "$report_file"
    
    log "Reporte guardado: $report_file"
}

# ============================================
# Main
# ============================================

main() {
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║      ScanQueue Backup Script              ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""
    
    check_prerequisites
    create_backup_dir
    
    log "Iniciando proceso de backup..."
    
    backup_database || error "Fallo backup de BD"
    backup_uploads || warning "Fallo backup de uploads"
    backup_logs || warning "Fallo backup de logs"
    backup_config || warning "Fallo backup de config"
    
    cleanup_old_backups
    
    # Opcional: upload S3
    # upload_to_s3
    
    generate_backup_report
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     ✓ BACKUP COMPLETADO EXITOSAMENTE      ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Ubicación de backups:${NC} ${YELLOW}$BACKUP_DIR${NC}"
    echo -e "${BLUE}Retención:${NC} ${YELLOW}$RETENTION_DAYS días${NC}"
    echo ""
}

main "$@"
